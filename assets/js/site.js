'use strict';

  let obs = null;

  function navigateTo(pageName) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    setActiveNavLink(pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (obs) {
      setTimeout(() => {
        document.querySelectorAll('.page.active .reveal').forEach(el => {
          obs.observe(el);
        });
      }, 100);
    }

  }

  function setActiveNavLink(pageName) {
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageName) {
        link.classList.add('active');
      }
    });
  }

  function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.toggle('open');
    }
  }

  function openAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) {
      return;
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const focusTarget = document.getElementById('admin-login-btn') || document.getElementById('admin-close-btn');
    if (focusTarget) {
      focusTarget.focus();
    }
  }

  function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) {
      return;
    }

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function initRevealObserver() {
    if (obs) {
      obs.disconnect();
    }

    obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  function refreshRevealObserver() {
    if (!obs) {
      return;
    }

    document.querySelectorAll('.page.active .reveal:not(.vis)').forEach(el => obs.observe(el));
  }

  window.refreshRevealObserver = refreshRevealObserver;

  function initTilt() {
    const tilt = document.getElementById('tilt');
    if (!tilt) {
      return;
    }

    const STRENGTH = 28;
    if (tilt._tiltMouseMove) {
      tilt.removeEventListener('mousemove', tilt._tiltMouseMove);
    }
    if (tilt._tiltMouseLeave) {
      tilt.removeEventListener('mouseleave', tilt._tiltMouseLeave);
    }

    const onMouseMove = event => {
      const rect = tilt.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (event.clientX - cx) / (rect.width / 2);
      const dy = (event.clientY - cy) / (rect.height / 2);
      const rotY = -dx * STRENGTH;
      const rotX = dy * STRENGTH;
      tilt.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
    };

    const onMouseLeave = () => {
      tilt.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    };

    tilt.addEventListener('mousemove', onMouseMove);
    tilt.addEventListener('mouseleave', onMouseLeave);
    tilt._tiltMouseMove = onMouseMove;
    tilt._tiltMouseLeave = onMouseLeave;

    tilt.dataset.tiltBound = 'true';
  }

  function copyEmail() {
    copyEmailWithFeedback('email-text', 'copy-icon');
  }

  function copyEmailPage() {
    copyEmailWithFeedback('email-text-page', 'copy-icon-page');
  }

  function copyEmailWithFeedback(textId, iconId) {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText('contact30450@gmail.com').then(() => {
      const text = document.getElementById(textId);
      const icon = document.getElementById(iconId);
      if (!text || !icon) {
        return;
      }

      text.textContent = 'Copied!';
      icon.style.opacity = '1';
      icon.innerHTML = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>';
      setTimeout(() => {
        text.textContent = 'contact30450@gmail.com';
        icon.style.opacity = '.5';
        icon.innerHTML = '<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/>';
      }, 2000);
    });
  }
