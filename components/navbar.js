// components/navbar.js
async function loadNavbar() {
    try {
        // CORRECTION DU CHEMIN : on ajoute /components/
        const response = await fetch('/components/navbar.html');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status} (Vérifiez le chemin du fichier)`);
        }
        
        const data = await response.text();
        document.body.insertAdjacentHTML('afterbegin', data);

        // On ne lance la logique QUE si l'injection a réussi
        initNavbarLogic();
        
    } catch (error) {
        console.error("Erreur lors du chargement de la navbar:", error);
    }
}

function initNavbarLogic() {
    const nav = document.getElementById('navbar');
    const burger = document.getElementById('burger');

    if (!nav || !burger) {
        console.warn("Éléments de la navbar introuvables dans le DOM.");
        return;
    }

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    burger.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        burger.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        if (!open) {
            document.querySelectorAll('.has-sub').forEach(li => li.classList.remove('open'));
        }
    });

    // Ajoute juste ça sous le bloc du burger.addEventListener
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1050) { // Ajuste 768 selon ton CSS
            document.body.style.overflow = '';
            nav.classList.remove('open');
            burger.classList.remove('open');
            document.querySelectorAll('.has-sub').forEach(li => li.classList.remove('open'));
        }
    });

    // ... (Reste de ton code de chevrons inchangé) ...
    document.querySelectorAll('.has-sub > a').forEach(link => {
        const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('class', 'nav-chevron');
        chevron.setAttribute('width', '14'); chevron.setAttribute('height', '14');
        chevron.setAttribute('viewBox', '0 0 24 24');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('stroke-width', '2');
        chevron.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
        link.appendChild(chevron);

        link.addEventListener('click', function(e) {
            if (!nav.classList.contains('open')) return;
            e.preventDefault();
            const li = this.closest('.has-sub');
            const wasOpen = li.classList.contains('open');
            document.querySelectorAll('.has-sub').forEach(d => d.classList.remove('open'));
            if (!wasOpen) li.classList.add('open');
        });
    });
}

loadNavbar();