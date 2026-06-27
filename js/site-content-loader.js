// js/site-content-loader.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Remplace avec tes vraies clés de projet Supabase
const SUPABASE_URL = 'https://eyjooultejiibshzvztm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_K125NqFqEzjQQ5QGsrur-Q_MYjzVH1V'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

document.addEventListener('DOMContentLoaded', () => {
  initCommissions()
  initPermanences()
})

/**
 * 1. Gestion de la page Conseil Municipal (Commissions)
 */
async function initCommissions() {
  const container = document.getElementById('commissions-container')
  if (!container) return // On n'est pas sur la bonne page, on s'arrête.

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'commissions_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const commissions = data.value

    // On boucle sur chaque bloc trouvé dans le HTML
    const blocks = document.querySelectorAll('[data-comm-id]')
    blocks.forEach(block => {
      const commKey = block.getAttribute('data-comm-id')
      const commData = commissions[commKey]

      if (!commData) return

      block.innerHTML = '' // On vide le conteneur

      if (commData.type === 'text') {
        // Cas particulier : Commission des impôts (CDID)
        block.innerHTML = `<div style="font-size: 0.85rem; color: var(--texte);">${commData.content}</div>`
      } else if (commData.type === 'roles') {
        // Cas général : Liste des rôles (Président, Membres, Titulaires...)
        commData.content.forEach(item => {
          const row = document.createElement('div')
          row.className = 'comm-row'
          row.innerHTML = `<strong>${item.role}</strong><span>${item.names}</span>`
          block.appendChild(row)
        })
      }
    })
  } catch (err) {
    console.error('Erreur lors du chargement des commissions:', err.message)
  }
}

/**
 * 2. Gestion de la page Horaires & Permanences
 */
async function initPermanences() {
  const container = document.getElementById('permanences-container')
  if (!container) return // On n'est pas sur la bonne page, on s'arrête.

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'permanences_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const permanences = data.value

    const cards = document.querySelectorAll('[data-perm-id]')
    cards.forEach(card => {
      const permKey = card.getAttribute('data-perm-id')
      const permData = permanences[permKey]

      if (!permData) return

      // 1. Injection des lignes d'horaires du tableau
      const horairesContainer = card.querySelector('.perm-horaires')
      if (horairesContainer) {
        horairesContainer.innerHTML = '' // On vide
        
        permData.rows.forEach(row => {
          const rowDiv = document.createElement('div')
          rowDiv.className = 'perm-horaire-row'
          
          const daySpan = `<span class="perm-day">${row.day}</span>`
          let hoursSpan = ''
          
          if (row.closed) {
            hoursSpan = `<span class="perm-hours" style="color:var(--gris); font-style:italic;">${row.hours}</span>`
          } else {
            hoursSpan = `<span class="perm-hours">${row.hours}</span>`
          }
          
          rowDiv.innerHTML = daySpan + hoursSpan
          horairesContainer.appendChild(rowDiv)
        })
      }

      // 2. Injection de la note de bas de carte si elle existe
      // On supprime l'ancienne s'il y en avait une
      const oldNote = card.querySelector('.perm-note')
      if (oldNote) oldNote.remove()

      if (permData.note && permData.note.trim() !== '') {
        const cardBody = card.querySelector('.perm-card-body')
        const noteDiv = document.createElement('div')
        noteDiv.className = 'perm-note'
        noteDiv.textContent = permData.note
        cardBody.appendChild(noteDiv)
      }
    })
  } catch (err) {
    console.error('Erreur lors du chargement des permanences:', err.message)
  }
}