const DATA_HORAIRES = {
    mairie: {
        config: {
            1: [[9, 12.5], [14, 17.5]], // Lun
            2: [[9, 12.5], [14, 17.5]], // Mar
            3: [[8.5, 12.5]],           // Mer
            4: [[9, 12.5], [14, 17.5]], // Jeu
            5: [[9, 12.5]],             // Ven
            6: [[8.5, 12.5]],           // Sam
            0: []                       // Dim
        },
        labels: {
            1: "Lun: 09:00–12:30 / 14:00–17:30",
            2: "Mar: 09:00–12:30 / 14:00–17:30",
            3: "Mer: 08:30–12:30",
            4: "Jeu: 09:00–12:30 / 14:00–17:30",
            5: "Ven: 09:00–12:30",
            6: "Sam: 08:30–12:30",
            0: "Dimanche: Fermé"
        }
    },
    urbanisme: {
        config: {
            2: [[9, 12]], // Mar
            5: [[9, 12]], // Ven
            0: [], 1: [], 3: [], 4: [], 6: [] 
        },
        labels: {
            2: "Mardi: 09:00–12:00",
            5: "Vendredi: 09:00–12:00",
            0: "Fermé (Autres jours sur RDV)"
        }
    }
};

function updateStatus(containerId, serviceKey) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const now = new Date();
    const day = now.getDay();
    const currentTime = now.getHours() + now.getMinutes() / 60;
    
    const service = DATA_HORAIRES[serviceKey];
    
    // 1. Mise à jour du texte "Aujourd'hui" (recherche par ID ou par classe)
    const todayText = container.querySelector('#today-text') || container.querySelector('.today-text');
    if (todayText) {
        const label = service.labels[day] || service.labels[0];
        todayText.innerHTML = `<strong>Aujourd'hui :</strong> ${label}`;
    }

    // 2. Calcul d'ouverture
    let isOpen = false;
    const intervals = service.config[day] || [];
    intervals.forEach(range => {
        if (currentTime >= range[0] && currentTime < range[1]) isOpen = true;
    });

    // 3. Mise à jour du badge
    const badge = container.querySelector('.status-badge');
    if (badge) {
        badge.textContent = isOpen ? "Ouvert" : "Fermé";
        badge.className = `status-badge ${isOpen ? 'open' : 'closed'}`;
    }

    // 4. Surlignage de la liste
    const listItems = container.querySelectorAll('.schedule-list li');
    listItems.forEach(li => {
        if(parseInt(li.getAttribute('data-day')) === day) li.classList.add('is-today');
    });
}