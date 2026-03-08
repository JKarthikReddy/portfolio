/* ============================================
   Jakka Karthik Reddy — Portfolio Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
  });

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }

  // ── Mobile nav toggle ──
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ── Stat counter animation ──
  const statCards = document.querySelectorAll('.stat-card');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statCards.forEach(card => counterObserver.observe(card));

  function animateCounter(card) {
    const target = parseInt(card.dataset.count);
    const numberEl = card.querySelector('.stat-number');
    const duration = 1500;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      numberEl.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Scroll reveal ──
  const revealElements = document.querySelectorAll(
    '.skill-category, .timeline-item, .project-card, .cert-group, .about-grid, .contact-grid'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Staggered reveal for grid items ──
  document.querySelectorAll('.skills-grid, .projects-grid, .cert-grid').forEach(grid => {
    const items = grid.children;
    Array.from(items).forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  // ── Download Resume ──
  document.getElementById('downloadResume').addEventListener('click', (e) => {
    e.preventDefault();
    const a = document.createElement('a');
    a.href = 'Resume_Jakka_Karthik_Reddy.pdf';
    a.download = 'Jakka_Karthik_Reddy_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // ── Share Portfolio ──
  document.getElementById('sharePortfolio').addEventListener('click', async () => {
    const shareData = {
      title: 'Jakka Karthik Reddy — Portfolio',
      text: 'Check out Jakka Karthik Reddy\'s AI & Data Science Portfolio!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showToast('Portfolio link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error
      if (err.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Portfolio link copied to clipboard!');
      }
    }
  });

  // ── Toast notification ──
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #fff;
      color: #0a0a0a;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ── Contact form ──
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    showToast(`Thanks ${name}! Your message has been received.`);
    e.target.reset();
  });

  // ── Smooth scroll for all anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
