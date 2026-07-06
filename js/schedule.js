// js/schedule.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://eyjooultejiibshzvztm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5am9vdWx0ZWppaWJzaHp2enRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjkzMDksImV4cCI6MjA5NzkwNTMwOX0.G69SkW-FpvP5RGsF6MhfXa3Jl-_OxHbfYURNo9Hqcvw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Correspondance entre les noms des jours en base de données et les index JavaScript (Date.getDay())
const MAP_JOURS = {
    "dimanche": 0, "lundi": 1, "mardi": 2, "mercredi": 3, "jeudi": 4, "vendredi": 5, "samedi": 6
};

/**
 * PARSEUR : Transforme une chaîne de type "09:00–12:30 / 14:00–17:30" ou "9h00-12h00"
 * en tableau d'intervalles numériques pour les calculs d'ouverture : [[9, 12.5], [14, 17.5]]
 */
function parseHoursToConfig(hoursStr, isClosed) {
    if (isClosed || !hoursStr || hoursStr.toLowerCase().includes('fermé')) {
        return [];
    }
    
    const intervals = [];
    // 1. Supprimer les balises HTML si présentes (ex: <small>...</small> de l'urbanisme)
    let cleanStr = hoursStr.replace(/<[^>]*>/g, '');
    // 2. Normaliser les tirets (en-dash, em-dash) et enlever les espaces
    cleanStr = cleanStr.replace(/–/g, '-').replace(/\s/g, '');
    
    // 3. Découper par les slashs pour les demi-journées
    const parts = cleanStr.split('/');
    
    parts.forEach(part => {
        const times = part.split('-');
        if (times.length === 2) {
            const startFloat = parseTimeToFloat(times[0]);
            const endFloat = parseTimeToFloat(times[1]);
            if (!isNaN(startFloat) && !isNaN(endFloat)) {
                intervals.push([startFloat, endFloat]);
            }
        }
    });
    
    return intervals;
}

/**
 * Convertit "08:30" ou "9h00" en float (8.5 ou 9.0)
 */
function parseTimeToFloat(timeStr) {
    const clean = timeStr.replace('h', ':');
    const [hours, minutes] = clean.split(':').map(Number);
    if (isNaN(hours)) return NaN;
    return hours + (minutes || 0) / 60;
}

/**
 * Calcule l'état et met à jour l'affichage d'un conteneur d'horaires
 */
function updateStatus(container, serviceData) {
    if (!container || !serviceData) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const currentTime = now.getHours() + now.getMinutes() / 60;
    
    // 1. Mise à jour du texte résumé "Aujourd'hui"
    const todayText = container.querySelector('#today-text') || container.querySelector('.today-text');
    if (todayText) {
        const currentLabel = serviceData.labels[day];
        if (currentLabel) {
            todayText.innerHTML = `<strong>Aujourd'hui :</strong> ${currentLabel.jour} (${currentLabel.heures})`;
        }
    }

    // 2. Génération dynamique de la liste hebdomadaire complète du dropdown
    const scheduleList = container.querySelector('.schedule-list');
    if (scheduleList) {
        scheduleList.innerHTML = '';
        
        // Ordre d'affichage logique : du Lundi (1) au Dimanche (0)
        const ordreJours = [1, 2, 3, 4, 5, 6, 0];
        
        ordreJours.forEach(d => {
            const labelData = serviceData.labels[d];
            if (!labelData) return;

            const li = document.createElement('li');
            li.setAttribute('data-day', d);
            li.innerHTML = `<span>${labelData.jour}</span> <strong>${labelData.heures}</strong>`;
            
            if (d === day) {
                li.classList.add('is-today');
            }
            scheduleList.appendChild(li);
        });
    }

    // 3. Calcul d'ouverture en temps réel
    let isOpen = false;
    const intervals = serviceData.config[day] || [];
    intervals.forEach(range => {
        if (currentTime >= range[0] && currentTime < range[1]) isOpen = true;
    });

    // 4. Mise à jour visuelle du badge d'état (Ouvert/Fermé)
    const badge = container.querySelector('.status-badge');
    if (badge) {
        badge.textContent = isOpen ? "Ouvert" : "Fermé";
        badge.className = `status-badge ${isOpen ? 'open' : 'closed'}`;
    }
}

// Fonction globale d'ouverture/fermeture du dropdown (conservée telle quelle)
window.toggleSchedule = function() {
    const dropdown = document.getElementById('scheduleDropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

/**
 * Initialisation principale : va chercher les données fraîches sur Supabase
 */
document.addEventListener('DOMContentLoaded', async () => {
    const dropdown = document.getElementById('scheduleDropdown');
    if (!dropdown) return;

    const serviceKey = dropdown.getAttribute('data-service') || 'mairie';

    try {
        const { data, error } = await supabase
            .from('site_content')
            .select('value')
            .eq('key', 'permanences_data')
            .single();

        if (error) throw error;
        if (!data || !data.value || !data.value[serviceKey]) return;

        const dbServiceData = data.value[serviceKey];

        // Reconstruction dynamique de la structure attendue par le moteur de calcul
        const serviceDataMapped = {
            config: { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] },
            labels: { 0:{}, 1:{}, 2:{}, 3:{}, 4:{}, 5:{}, 6:{} }
        };

        dbServiceData.rows.forEach(row => {
            const dayIndex = MAP_JOURS[row.day.toLowerCase().trim()];
            if (dayIndex !== undefined) {
                // Le parseur génère le tableau d'intervalles numériques à la volée
                serviceDataMapped.config[dayIndex] = parseHoursToConfig(row.hours, row.closed);
                serviceDataMapped.labels[dayIndex] = {
                    jour: row.day,
                    heures: row.hours
                };
            }
        });

        // Lancement de la mise à jour visuelle avec la structure générée
        updateStatus(dropdown, serviceDataMapped);

    } catch (err) {
        console.error("Erreur lors de la synchronisation dynamique du widget horaires :", err.message);
    }
});