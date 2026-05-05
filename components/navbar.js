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

    // --- 1. INJECTION DES ACCÈS RAPIDES ---
    const quickAccessHTML = `
        <div id="fixed-quick-access" class="quick-access">
            <a href="#" class="qa-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>État civil</span>
            </a>
            <a href="#" class="qa-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 21V9"/></svg>
                <span>Conseil</span>
            </a>
            <a href="#" class="qa-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>Interco</span>
            </a>
            <a href="/enfance-loisirs/ecoles/sivu.html" class="qa-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/></svg>
                <span>Écoles</span>
            </a>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', quickAccessHTML);

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