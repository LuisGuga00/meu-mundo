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

/* ============================================================ */
/* NEURAL NETWORK — canvas com nós/sinapses ao redor da foto    */
/* ============================================================ */
(function spawnNeural() {
  const canvas = document.getElementById('neural');
  if (!canvas) return;

  const wrap = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  // Conta badges pra evitar desenhar nós em cima deles
  const badges = wrap.querySelectorAll('.badge');

  const NODE_COUNT = 26;
  const MAX_DIST   = 95;
  let w = 0, h = 0, cx = 0, cy = 0, r = 0;
  let nodes = [];

  function getBadgeCenters() {
    // posição do wrap + offset do badge -> coordenadas absolutas do canvas
    const wrapRect = wrap.getBoundingClientRect();
    return Array.from(badges).map(b => {
      const r = b.getBoundingClientRect();
      return {
        x: (r.left - wrapRect.left) + r.width / 2,
        y: (r.top  - wrapRect.top)  + r.height / 2,
        rad: r.width / 2 + 12 // folga ao redor do badge
      };
    });
  }

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width  = rect.width  + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = rect.width; h = rect.height;
    cx = w / 2; cy = h / 2;
    // Raio do anel de nós — fica entre a foto e os badges
    r = Math.min(w, h) * 0.40;
    initNodes();
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const ang = Math.random() * Math.PI * 2;
      const radius = r * (0.82 + Math.random() * 0.18);
      nodes.push({
        x: cx + Math.cos(ang) * radius,
        y: cy + Math.sin(ang) * radius,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 2 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function distToBadges(x, y, centers) {
    let minD = Infinity;
    for (const b of centers) {
      const dx = x - b.x, dy = y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy) - b.rad;
      if (d < minD) minD = d;
    }
    return minD;
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    const centers = getBadgeCenters();

    // mover nós
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.04;

      // mantém numa coroa ao redor da foto
      const dx = n.x - cx, dy = n.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const target = r * (0.82 + 0.18 * Math.sin(n.pulse * 0.5));
      const diff = dist - target;
      n.vx -= (dx / (dist || 1)) * diff * 0.002;
      n.vy -= (dy / (dist || 1)) * diff * 0.002;

      // afasta de badges
      const db = distToBadges(n.x, n.y, centers);
      if (db < 0) {
        // empurra radial pra longe do badge mais próximo
        let nearest = centers[0];
        let bestD = Infinity;
        for (const b of centers) {
          const ddx = n.x - b.x, ddy = n.y - b.y;
          const dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < bestD) { bestD = dd; nearest = b; }
        }
        const ax = (n.x - nearest.x) / (bestD || 1);
        const ay = (n.y - nearest.y) / (bestD || 1);
        n.vx += ax * 0.4;
        n.vy += ay * 0.4;
      }

      n.vx *= 0.985;
      n.vy *= 0.985;
    }

    // linhas
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.55;
          ctx.strokeStyle = `rgba(255, 42, 42, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.shadowColor = 'rgba(255, 42, 42, 0.8)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0;

    // nós
    for (const n of nodes) {
      // pula se cair em cima de badge
      const db = distToBadges(n.x, n.y, centers);
      if (db < 0) continue;
      const pulseR = n.r + Math.sin(n.pulse) * 1.2;
      ctx.fillStyle = '#ff5555';
      ctx.shadowColor = 'rgba(255, 42, 42, 1)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();

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

// === Internationalization (PT / EN) ===
const translations = {
  pt: {
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.projects': 'Projetos',
    'nav.contact': 'Contato',
    'hero.greeting': 'Oi, eu sou <span>Luis Gustavo</span>',
    'hero.role': 'Desenvolvedor e analista de sistemas',
    'hero.th.category': 'Categoria',
    'hero.th.about': 'Sobre mim',
    'hero.edu.label': 'Formação',
    'hero.edu.value': 'Ensino médio completo - Zeta Objetivo em Birigui<br />Curso de assistente de Logística completo - Portal IDEA',
    'hero.tech.label': 'Tecnologias',
    'hero.tech.value': 'HTML, CSS, JavaScript e criação de interfaces web funcionais.',
    'hero.diff.label': 'Diferencial',
    'hero.diff.value': 'Experiência administrativa, organização e atenção aos detalhes em cada projeto.',
    'hero.cta.projects': 'Ver Projetos',
    'hero.cta.contact': 'Contato',
    'about.title': 'Sobre mim',
    'about.summary.title': 'Resumo',
    'about.summary.text': 'Sou estudante de Análise e Desenvolvimento de Sistemas no Unisalesiano e possuo experiência na área administrativa. Atualmente, estou evoluindo na área de desenvolvimento com foco na criação de soluções web modernas e funcionais.',
    'about.goals.title': 'Objetivos',
    'about.goals.text1': 'Projeto desenvolvido com o objetivo de implementar um catálogo e sistema de navegação de produtos, buscando explorar a construção da interface utilizando exclusivamente HTML, sem a aplicação de CSS.',
    'about.goals.text2': 'Quero continuar estudando JavaScript e frameworks modernos para evoluir cada vez mais como profissional.',
    'about.work.title': 'Onde Trabalhei',
    'about.work.1': 'Anhembi Morumbi - Encarregado Administrativo',
    'about.work.2': 'Alta Noroeste Araçatuba - Assistente Administrativo',
    'about.work.3': 'Conserta Bike Araçatuba - Encarregado Administrativo e Mecânico',
    'about.work.4': 'Mundo Móveis - Auxiliar de Produção',
    'about.work.5': "Bento's Butiquim - Auxiliar Geral",
    'skills.th.category': 'Categoria',
    'skills.th.skills': 'Habilidades e Tecnologias',
    'skills.web.label': 'Desenvolvimento Web',
    'skills.web.value': 'HTML, CSS, JavaScript, Desenvolvimento Web (Front-end)',
    'skills.langs.label': 'Linguagens',
    'skills.langs.value': 'C++, Java (Básico/Intermediário), Conceitos de .NET',
    'skills.db.label': 'Banco de Dados',
    'skills.db.value': 'SQL Server (Básico/Intermediário), Modelagem e Administração de Banco de Dados',
    'skills.meth.label': 'Metodologias',
    'skills.meth.value': 'Conceitos de Projeto e Testes de Software, Suporte e Manutenção de Sistemas',
    'projects.title': 'Projetos',
    'projects.p1': 'Loja Virtual',
    'projects.p2': 'Site Games',
    'projects.p3': 'Projeto Web',
    'projects.p4': 'Visual',
    'projects.p5': 'Visual',
    'projects.demo': 'Live Demo',
    'contact.title': 'Contato',
    'contact.lead': 'Vamos colaborar? Estou aberto a novos projetos e oportunidades.',
    'contact.location': 'Araçatuba - SP',
    'contact.form.name': 'Seu nome',
    'contact.form.email': 'Seu e-mail',
    'contact.form.msg': 'Sua mensagem',
    'contact.form.submit': 'Enviar mensagem',
    'footer.name': 'Luis Gustavo',
    'footer.rights': 'Todos os direitos reservados',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'hero.greeting': "Hi, I'm <span>Luis Gustavo</span>",
    'hero.role': 'Developer and systems analyst',
    'hero.th.category': 'Category',
    'hero.th.about': 'About me',
    'hero.edu.label': 'Education',
    'hero.edu.value': 'High school diploma - Zeta Objetivo in Birigui<br />Logistics assistant course - Portal IDEA',
    'hero.tech.label': 'Technologies',
    'hero.tech.value': 'HTML, CSS, JavaScript and building functional web interfaces.',
    'hero.diff.label': 'Strengths',
    'hero.diff.value': 'Administrative background, organization and attention to detail in every project.',
    'hero.cta.projects': 'View Projects',
    'hero.cta.contact': 'Contact',
    'about.title': 'About me',
    'about.summary.title': 'Summary',
    'about.summary.text': "I'm a Systems Analysis and Development student at Unisalesiano with experience in administration. I'm currently growing in the development area, focused on building modern and functional web solutions.",
    'about.goals.title': 'Goals',
    'about.goals.text1': 'Project developed with the goal of implementing a catalog and product navigation system, exploring the construction of the interface using only HTML, without applying CSS.',
    'about.goals.text2': 'I want to keep studying JavaScript and modern frameworks to grow more and more as a professional.',
    'about.work.title': 'Where I worked',
    'about.work.1': 'Anhembi Morumbi - Administrative Supervisor',
    'about.work.2': 'Alta Noroeste Araçatuba - Administrative Assistant',
    'about.work.3': 'Conserta Bike Araçatuba - Administrative Supervisor and Mechanic',
    'about.work.4': 'Mundo Móveis - Production Assistant',
    'about.work.5': "Bento's Butiquim - General Assistant",
    'skills.th.category': 'Category',
    'skills.th.skills': 'Skills and Technologies',
    'skills.web.label': 'Web Development',
    'skills.web.value': 'HTML, CSS, JavaScript, Web Development (Front-end)',
    'skills.langs.label': 'Languages',
    'skills.langs.value': 'C++, Java (Basic/Intermediate), .NET concepts',
    'skills.db.label': 'Database',
    'skills.db.value': 'SQL Server (Basic/Intermediate), Database modeling and administration',
    'skills.meth.label': 'Methodologies',
    'skills.meth.value': 'Software project and testing concepts, system support and maintenance',
    'projects.title': 'Projects',
    'projects.p1': 'Online Store',
    'projects.p2': 'Games Website',
    'projects.p3': 'Web Project',
    'projects.p4': 'Visual',
    'projects.p5': 'Visual',
    'projects.demo': 'Live Demo',
    'contact.title': 'Contact',
    'contact.lead': "Let's collaborate? I'm open to new projects and opportunities.",
    'contact.location': 'Araçatuba - SP',
    'contact.form.name': 'Your name',
    'contact.form.email': 'Your e-mail',
    'contact.form.msg': 'Your message',
    'contact.form.submit': 'Send message',
    'footer.name': 'Luis Gustavo',
    'footer.rights': 'All rights reserved',
  },
};

const LANG_KEY = 'portfolio-lang';
const html = document.documentElement;
const langButtons = document.querySelectorAll('.lang-toggle button');

function applyLanguage(lang) {
  const dict = translations[lang] || translations.pt;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key];
    if (value === undefined) return;
    el.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    const value = dict[key];
    if (value === undefined) return;
    el.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = dict[key];
    if (value === undefined) return;
    el.setAttribute('placeholder', value);
  });

  html.setAttribute('lang', lang === 'en' ? 'en' : 'pt-BR');
  html.setAttribute('data-lang', lang);

  langButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (_) {
    /* localStorage indisponível, sem problema */
  }
}

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    if (lang) applyLanguage(lang);
  });
});

// Carrega idioma salvo ou detecta pelo navegador
let savedLang = null;
try {
  savedLang = localStorage.getItem(LANG_KEY);
} catch (_) {
  /* ignore */
}

if (savedLang === 'en' || savedLang === 'pt') {
  applyLanguage(savedLang);
} else {
  const browserLang = (navigator.language || 'pt-BR').toLowerCase();
  applyLanguage(browserLang.startsWith('pt') ? 'pt' : 'en');
}
