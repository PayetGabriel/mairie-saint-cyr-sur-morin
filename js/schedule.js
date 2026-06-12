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
            1: { jour: "Lundi", heures: "09:00–12:30 / 14:00–17:30" },
            2: { jour: "Mardi", heures: "09:00–12:30 / 14:00–17:30" },
            3: { jour: "Mercredi", heures: "08:30–12:30" },
            4: { jour: "Jeudi", heures: "09:00–12:30 / 14:00–17:30" },
            5: { jour: "Vendredi", heures: "09:00–12:30" },
            6: { jour: "Samedi", heures: "08:30–12:30" },
            0: { jour: "Dimanche", heures: "Fermé" }
        }
    },
    urbanisme: {
        config: {
            2: [[9, 12]], // Mar
            5: [[9, 12]], // Ven
            1: [], 3: [], 4: [], 6: [], 0: []
        },
        labels: {
            1: { jour: "Lundi", heures: "Fermé (Sur RDV)" },
            2: { jour: "Mardi", heures: "09:00–12:00" },
            3: { jour: "Mercredi", heures: "Fermé (Sur RDV)" },
            4: { jour: "Jeudi", heures: "Fermé (Sur RDV)" },
            5: { jour: "Vendredi", heures: "09:00–12:00" },
            6: { jour: "Samedi", heures: "Fermé" },
            0: { jour: "Dimanche", heures: "Fermé" }
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
    if (!service) return;
    
    // 1. Mise à jour du texte résumé "Aujourd'hui"
    const todayText = container.querySelector('#today-text') || container.querySelector('.today-text');
    if (todayText) {
        const currentLabel = service.labels[day];
        todayText.innerHTML = `<strong>Aujourd'hui :</strong> ${currentLabel.jour} (${currentLabel.heures})`;
    }

    // 1.5 GÉNÉRATION DYNAMIQUE DE LA LISTE DES HORAIRES
    const scheduleList = container.querySelector('.schedule-list');
    if (scheduleList) {
        scheduleList.innerHTML = ''; // On vide l'ancienne liste au cas où
        
        // On boucle du Lundi (1) au Dimanche (0) pour afficher la semaine dans l'ordre logique
        const ordreJours = [1, 2, 3, 4, 5, 6, 0];
        
        ordreJours.forEach(d => {
            const labelData = service.labels[d];
            const li = document.createElement('li');
            li.setAttribute('data-day', d);
            li.innerHTML = `<span>${labelData.jour}</span> <strong>${labelData.heures}</strong>`;
            
            // Surlignage si c'est le jour actuel
            if (d === day) {
                li.classList.add('is-today');
            }
            
            scheduleList.appendChild(li);
        });
    }

    // 2. Calcul d'ouverture réelle
    let isOpen = false;
    const intervals = service.config[day] || [];
    intervals.forEach(range => {
        if (currentTime >= range[0] && currentTime < range[1]) isOpen = true;
    });

    // 3. Mise à jour du badge d'état
    const badge = container.querySelector('.status-badge');
    if (badge) {
        badge.textContent = isOpen ? "Ouvert" : "Fermé";
        badge.className = `status-badge ${isOpen ? 'open' : 'closed'}`;
    }
}

// Fonction globale d'ouverture/fermeture du dropdown
function toggleSchedule() {
    const dropdown = document.getElementById('scheduleDropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

// Ce bloc s'exécute tout seul sur toutes les pages qui importent schedule.js
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('scheduleDropdown');
    if (dropdown) {
        const service = dropdown.getAttribute('data-service') || 'mairie';
        updateStatus('scheduleDropdown', service);
    }
});