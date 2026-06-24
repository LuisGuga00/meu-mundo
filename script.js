const menuLinks = document.querySelectorAll('.menu-link');
const sections = document.querySelectorAll('main .section');
const reveals = document.querySelectorAll('.reveal');
const year = document.getElementById('current-year');

if (year) {
  year.textContent = new Date().getFullYear();
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute('id');

      menuLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', isActive);
      });
    });
  },
  { threshold: 0.45 }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
);

reveals.forEach((item) => revealObserver.observe(item));

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const nextInput = contactForm.querySelector('input[name="_next"]');

  if (nextInput) {
    const nextUrl = new URL(window.location.href);
    nextUrl.hash = 'contact';
    nextInput.value = nextUrl.toString();
  }
}

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const requestUrl = form.dataset.ajaxAction || form.action;

  if (status) {
    status.textContent = 'Enviando mensagem...';
    status.classList.remove('is-success', 'is-error');
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
  }

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha no envio');
    }

    form.reset();

    if (status) {
      status.textContent = 'Mensagem enviada com sucesso. Vou receber no e-mail cadastrado.';
      status.classList.remove('is-error');
      status.classList.add('is-success');
    }
  } catch (error) {
    if (status) {
      status.textContent = 'Nao foi possivel enviar agora. Tente novamente em instantes.';
      status.classList.remove('is-success');
      status.classList.add('is-error');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar mensagem';
    }
  }
});

const backgroundCanvas = document.getElementById('bg');

if (backgroundCanvas) {
  const ctx = backgroundCanvas.getContext('2d');
  const pointer = { x: null, y: null };
  let particles = [];

  function setCanvasSize() {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
  }

  class BackgroundParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.shadowColor = 'rgba(255, 59, 59, 0.45)';
      ctx.shadowBlur = 18;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (pointer.x !== null && pointer.y !== null) {
        const dx = this.x - pointer.x;
        const dy = this.y - pointer.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 110) {
          this.x += dx / 35;
          this.y += dy / 35;
        }
      }

      if (this.x < 0 || this.x > backgroundCanvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > backgroundCanvas.height) this.vy *= -1;
    }
  }

  function createBackgroundParticles() {
    particles = [];
    const total = window.innerWidth < 780 ? 70 : 120;

    for (let index = 0; index < total; index += 1) {
      particles.push(
        new BackgroundParticle(
          Math.random() * backgroundCanvas.width,
          Math.random() * backgroundCanvas.height
        )
      );
    }
  }

  function animateBackground() {
    ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    for (let index = 0; index < particles.length; index += 1) {
      for (let next = index + 1; next < particles.length; next += 1) {
        const dx = particles[index].x - particles[next].x;
        const dy = particles[index].y - particles[next].y;
        const distance = Math.hypot(dx, dy);

        if (distance > 120) continue;

        ctx.beginPath();
        ctx.moveTo(particles[index].x, particles[index].y);
        ctx.lineTo(particles[next].x, particles[next].y);
        ctx.strokeStyle = `rgba(255, 59, 59, ${0.14 - distance / 1100})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    requestAnimationFrame(animateBackground);
  }

  window.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });

  window.addEventListener('mouseleave', () => {
    pointer.x = null;
    pointer.y = null;
  });

  window.addEventListener('resize', () => {
    setCanvasSize();
    createBackgroundParticles();
  });

  setCanvasSize();
  createBackgroundParticles();
  animateBackground();
}

const hoverTiltElements = document.querySelectorAll('.hover-tilt');

hoverTiltElements.forEach((element) => {
  element.addEventListener('mousemove', (event) => {
    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const rotateY = ((offsetX / rect.width) - 0.5) * 10;
    const rotateX = (0.5 - (offsetY / rect.height)) * 10;

    element.style.setProperty('--mx', `${(offsetX / rect.width) * 100}%`);
    element.style.setProperty('--my', `${(offsetY / rect.height) * 100}%`);
    element.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = '';
    element.style.removeProperty('--mx');
    element.style.removeProperty('--my');
  });
});

/* ============================================================ */
/* NEON GAMER ANIMATIONS                                        */
/* ============================================================ */

// Cursor customizado neon
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const isCoarsePointer = window.matchMedia('(hover: none)').matches;

if (cursor && cursorDot && !isCoarsePointer) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Detecta elementos interativos para "engordar" o cursor
  const interactiveElements = document.querySelectorAll('a, button, .icon-link, .btn, .menu-link, .project-card, .about-card, input, textarea');

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  // Esconde o cursor quando sai da janela
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });
}

// Adiciona classe "is-loaded" no body após carregamento
window.addEventListener('load', () => {
  document.body.classList.add('is-loaded');
});

/* ============================================================ */
/* PROJECT MODAL                                                */
/* ============================================================ */

const projectModal = document.getElementById('projectModal');
const modalIframe = projectModal?.querySelector('.modal-iframe');
const modalLoader = projectModal?.querySelector('.modal-loader');
const modalTitleEl = projectModal?.querySelector('#modalTitle');
const modalExternal = projectModal?.querySelector('.modal-external');

function openProjectModal(trigger) {
  if (!projectModal || !modalIframe) return;

  const projectUrl = trigger.dataset.project || trigger.getAttribute('href');
  const projectTitle = trigger.dataset.title || 'Projeto';

  modalIframe.src = '';
  modalIframe.classList.remove('is-loaded');
  modalLoader?.classList.remove('is-hidden');
  if (modalTitleEl) modalTitleEl.textContent = projectTitle;
  if (modalExternal) modalExternal.href = projectUrl;

  projectModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';

  modalIframe.addEventListener('load', function onLoad() {
    modalIframe.classList.add('is-loaded');
    modalLoader?.classList.add('is-hidden');
    modalIframe.removeEventListener('load', onLoad);
  });

  // Pequeno delay pra animação de entrada começar antes do conteúdo carregar
  setTimeout(() => {
    modalIframe.src = projectUrl;
  }, 80);
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';

  // Limpa iframe depois da animação
  setTimeout(() => {
    if (modalIframe && !projectModal.classList.contains('is-open')) {
      modalIframe.src = '';
    }
  }, 500);
}

document.querySelectorAll('[data-modal="modal"]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openProjectModal(trigger);
  });
});

document.querySelectorAll('[data-close="modal"]').forEach((closeEl) => {
  closeEl.addEventListener('click', closeProjectModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && projectModal?.getAttribute('aria-hidden') === 'false') {
    closeProjectModal();
  }
});

/* ============================================================ */
/* LOADING SCREEN — Matrix + Glitch                             */
/* ============================================================ */

const loadingScreen = document.getElementById('loadingScreen');
const loadingCanvas = document.getElementById('loadingCanvas');

function runLoadingSequence() {
  if (!loadingScreen) return;

  if (loadingCanvas && loadingCanvas.getContext) {
    const ctx = loadingCanvas.getContext('2d');
    let columns = [];
    let drops = [];
    const fontSize = 14;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789LUISGUSTAVO<>/{}[]';

    function resizeCanvas() {
      loadingCanvas.width = window.innerWidth;
      loadingCanvas.height = window.innerHeight;
      const columnCount = Math.floor(loadingCanvas.width / fontSize);
      columns = new Array(columnCount).fill(0);
      drops = new Array(columnCount).fill(1);
    }

    function drawMatrix() {
      ctx.fillStyle = 'rgba(2, 2, 3, 0.06)';
      ctx.fillRect(0, 0, loadingCanvas.width, loadingCanvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns.length; i += 1) {
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Cor: branco no topo, vermelho neon no resto
        if (drops[i] * fontSize < fontSize * 2) {
          ctx.fillStyle = '#ff2a2a';
          ctx.shadowColor = 'rgba(255, 42, 42, 0.9)';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.shadowBlur = 0;
        }
        ctx.fillText(char, x, y);

        if (y > loadingCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const matrixInterval = setInterval(drawMatrix, 45);

    setTimeout(() => {
      clearInterval(matrixInterval);
      ctx.clearRect(0, 0, loadingCanvas.width, loadingCanvas.height);
    }, 2400);
  }

  // Some com a tela de loading depois de 2.5s
  setTimeout(() => {
    loadingScreen.classList.add('is-hidden');
    document.body.classList.add('is-loaded');
  }, 2500);

  setTimeout(() => {
    loadingScreen.remove();
  }, 3500);
}

// Roda o loading imediatamente
runLoadingSequence();

/* ============================================================ */
/* GAME — Mata o bicho (removido)                               */
/* ============================================================ */
