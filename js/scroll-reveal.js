// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      
      // On ajoute '.tu-card' au sélecteur pour qu'elles profitent aussi du décalage (stagger effect)
      e.target.querySelectorAll('.acces-card, .actu-item, .tu-card').forEach((el, i) => {
        el.style.transitionDelay = `${i * 60}ms`;
      });

      // Optionnel : on arrête d'observer ce bloc une fois qu'il est visible
      observer.unobserve(e.target);
    }
  });
}, { 
  threshold: 0.05,             // Déclenche un poil plus tôt sur la hauteur de l'élément
  rootMargin: '0px 0px -60px 0px' // IMPORTANT : Force le bloc à attendre d'être entré de 60px dans l'écran avant de s'animer. Ça te laisse le temps de le voir apparaître !
});

reveals.forEach(r => observer.observe(r));