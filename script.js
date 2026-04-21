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
