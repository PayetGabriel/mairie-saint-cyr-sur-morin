// Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        e.target.querySelectorAll('.acces-card, .actu-item').forEach((el, i) => {
          el.style.transitionDelay = `${i * 60}ms`;
        });
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(r => observer.observe(r));