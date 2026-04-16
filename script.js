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
      this.size = Math.random() * 1.0 + 0.8;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.shadowColor = 'rgb(255, 255, 255)';
      ctx.shadowBlur = 100;
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

        if (distance < 60) {
          this.x += dx / 20;
          this.y += dy / 20;
        }
      }

      if (this.x < 0 || this.x > backgroundCanvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > backgroundCanvas.height) this.vy *= -1;
    }
  }

  function createBackgroundParticles() {
    particles = [];
    const total = window.innerWidth < 1000 ? 500 : 500;

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
