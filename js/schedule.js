function updateMairieStatus() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const min = now.getMinutes();
    const currentTime = hour + min / 60;

    const statusBadge = document.querySelector('.status-badge');
    const todayText = document.getElementById('today-text');
    
    // Définition des horaires (pour le texte dynamique)
    const schedules = {
        1: "Lun: 09:00–12:30 / 14:00–17:30",
        2: "Mar: 09:00–12:30 / 14:00–17:30",
        3: "Mer: 08:30–12:30",
        4: "Jeu: 09:00–12:30 / 14:00–17:30",
        5: "Ven: 09:00–12:30",
        6: "Sam: 08:30–12:30",
        0: "Dimanche: Fermé"
    };

    // Mise à jour du texte de la barre
    todayText.innerHTML = `<strong>Aujourd'hui :</strong> ${schedules[day]}`;

    // Surligner le jour dans la liste
    const listItems = document.querySelectorAll('.schedule-list li');
    listItems.forEach(li => {
        if(parseInt(li.getAttribute('data-day')) === day) li.classList.add('is-today');
    });

    // Logique d'ouverture (réutilisée de l'étape précédente)
    let isOpen = false;
    if ([1, 2, 4].includes(day)) isOpen = (currentTime >= 9 && currentTime < 12.5) || (currentTime >= 14 && currentTime < 17.5);
    else if ([3, 6].includes(day)) isOpen = (currentTime >= 8.5 && currentTime < 12.5);
    else if (day === 5) isOpen = (currentTime >= 9 && currentTime < 12.5);

    if (isOpen) {
    statusBadge.textContent = "Ouvert";
    statusBadge.className = "status-badge open"; // Applique le style pilule verte
    } else {
        statusBadge.textContent = "Fermé";
        statusBadge.className = "status-badge closed"; // Applique le style pilule rouge
    }
}

document.addEventListener('DOMContentLoaded', updateMairieStatus);