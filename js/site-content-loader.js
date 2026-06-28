// js/site-content-loader.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://eyjooultejiibshzvztm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5am9vdWx0ZWppaWJzaHp2enRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjkzMDksImV4cCI6MjA5NzkwNTMwOX0.G69SkW-FpvP5RGsF6MhfXa3Jl-_OxHbfYURNo9Hqcvw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Dictionnaire immuable des SVGs d'origine associés aux clés des sections
const SECTION_SVGS = {
  "cni": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  "recensement": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  "sortie-territoire": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  "mariage": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  "parrainage": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "listes-electorales": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  "procuration": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  "attestation-accueil": `<svg width="22" height="22" fill="none" stroke-width="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
}

const EXTERNAL_LINK_SVG = `<svg width="13" height="13" fill="none" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
const DOWNLOAD_SVG = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
const DOC_PACS_SVG = `<svg width="16" height="16" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`

document.addEventListener('DOMContentLoaded', () => {
  initCommissions()
  initPermanences()
  initEtatCivil()
  initDechets()
})

/**
 * 1. Gestion de la page Conseil Municipal (Commissions)
 */
async function initCommissions() {
  const container = document.getElementById('commissions-container')
  if (!container) return
  try {
    const { data, error } = await supabase.from('site_content').select('value').eq('key', 'commissions_data').single()
    if (error) throw error
    if (!data || !data.value) return
    const commissions = data.value
    const blocks = document.querySelectorAll('[data-comm-id]')
    blocks.forEach(block => {
      const commKey = block.getAttribute('data-comm-id')
      const commData = commissions[commKey]
      if (!commData) return
      block.innerHTML = ''
      if (commData.type === 'text') {
        block.innerHTML = `<div style="font-size: 0.85rem; color: var(--texte);">${commData.content}</div>`
      } else if (commData.type === 'roles') {
        commData.content.forEach(item => {
          const row = document.createElement('div')
          row.className = 'comm-row'
          row.innerHTML = `<strong>${item.role}</strong><span>${item.names}</span>`
          block.appendChild(row)
        })
      }
    })
  } catch (err) {
    console.error("Erreur lors du chargement des commissions:", err.message)
  }
}

/**
 * 2. Gestion de la page Horaires & Permanences
 */
async function initPermanences() {
  const container = document.getElementById('permanences-container')
  if (!container) return
  try {
    const { data, error } = await supabase.from('site_content').select('value').eq('key', 'permanences_data').single()
    if (error) throw error
    if (!data || !data.value) return
    const permanences = data.value
    const cards = document.querySelectorAll('[data-perm-id]')
    cards.forEach(card => {
      const permKey = card.getAttribute('data-perm-id')
      const permData = permanences[permKey]
      if (!permData) return
      const horairesContainer = card.querySelector('.perm-horaires')
      if (horairesContainer) {
        horairesContainer.innerHTML = ''
        permData.rows.forEach(row => {
          const rowDiv = document.createElement('div')
          rowDiv.className = 'perm-horaire-row'
          const daySpan = `<span class="perm-day">${row.day}</span>`
          let hoursSpan = row.closed 
            ? `<span class="perm-hours" style="color:var(--gris); font-style:italic;">${row.hours}</span>`
            : `<span class="perm-hours">${row.hours}</span>`
          rowDiv.innerHTML = daySpan + hoursSpan
          horairesContainer.appendChild(rowDiv)
        })
      }
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
    console.error("Erreur lors du chargement des permanences:", err.message)
  }
}

/**
 * 3. Gestion de la page État Civil (Modulable et Triable)
 */
async function initEtatCivil() {
  const container = document.getElementById('etat-civil-container')
  if (!container) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'etat_civil_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // A. Injection propre de la date de mise à jour (sans double espace et bien isolée)
    const dateTextSpan = document.getElementById('etat-civil-update-date')
    if (dateTextSpan && pageData.update_date) {
    // On écrit la phrase complète ici pour maîtriser l'espace à 100%
    dateTextSpan.textContent = `Mis à jour le ${pageData.update_date}`
    }

    // B. Vidage complet du conteneur
    container.innerHTML = ''

    // C. Boucle sur le tableau d'ordonnancement (sections_order)
    pageData.sections_order.forEach(sectionKey => {
      const sData = pageData.sections[sectionKey]
      if (!sData) return

      const bloc = document.createElement('div')
      // Note : On garde la classe reveal pour le style et l'animation
      bloc.className = 'demarche-bloc reveal'
      bloc.id = sectionKey

      const currentSvg = SECTION_SVGS[sectionKey] || ''
      const headHTML = `
        <div class="demarche-bloc-head">
          <div class="demarche-icon">${currentSvg}</div>
          <div><h2>${sData.title}</h2></div>
        </div>
      `

      const hasPieces = sData.pieces && sData.pieces.length > 0
      const contentWrapperClass = hasPieces ? 'demarche-layout' : 'demarche-body'
      
      let bodyHTML = `<div class="${contentWrapperClass}">`
      
      if (hasPieces) {
        bodyHTML += `<div class="demarche-body">`
      }

      if (sData.paragraphs) {
        sData.paragraphs.forEach(pText => {
          bodyHTML += `<p>${pText}</p>`
        })
      }

      if (sData.biometrie) {
        bodyHTML += `
          <div class="mairies-biometrie">
            <strong>Mairies équipées dans le secteur</strong>
            ${sData.biometrie}
          </div>
        `
      }

      if (sData.main_btn) {
        bodyHTML += `
          <div style="margin-bottom: 2rem;">
            <a href="${sData.main_btn.url}" class="btn btn-outline" style="display: inline-flex;" target="_blank">
              ${DOWNLOAD_SVG} ${sData.main_btn.label}
            </a>
          </div>
        `
      }

      if (sData.note) {
        const alertClass = sData.note.is_alert ? ' alert' : ''
        const noteStyle = sectionKey === 'sortie-territoire' ? ' style="margin: 1.25rem 0;"' : ''
        bodyHTML += `
          <div class="info-note${alertClass}"${noteStyle}>
            ${sData.note.text}
          </div>
        `
      }

      if (sData.links && sData.links.length > 0) {
        const flexContainerStyle = sectionKey === 'cni' ? ' style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem;"' : ''
        bodyHTML += `<div${flexContainerStyle}>`
        sData.links.forEach(link => {
          bodyHTML += `
            <a href="${link.url}" target="_blank" rel="noopener" class="sp-link">
              ${EXTERNAL_LINK_SVG} ${link.label}
            </a>
          `
        })
        bodyHTML += `</div>`
      }

      if (sData.pacs_links && sData.pacs_links.length > 0) {
        bodyHTML += `<div class="docs-pacs">`
        sData.pacs_links.forEach(pLink => {
          bodyHTML += `
            <a href="${pLink.url}" class="doc-pacs-link" target="_blank">
              ${DOC_PACS_SVG} ${pLink.label}
            </a>
          `
        })
        bodyHTML += `</div>`
      }

      if (hasPieces) {
        bodyHTML += `</div>`
        bodyHTML += `
          <div class="pieces-card">
            <h4>Pièces à fournir</h4>
            <ul>
        `
        sData.pieces.forEach(pieceItem => {
          bodyHTML += `<li>${pieceItem}</li>`
        })
        bodyHTML += `
            </ul>
          </div>
        `
      }

      bodyHTML += `</div>`

      bloc.innerHTML = headHTML + bodyHTML
      container.appendChild(bloc)
    })

    // ─────────────────────────────────────────────────────────
    // D. SYSTEME DE RE-TRIGGER POUR LA CLASSE "REVEAL"
    // ─────────────────────────────────────────────────────────
    
    // On vérifie si ton observateur global existe
    if (window.revealObserver) {
      // On va chercher tous les nouveaux blocs .reveal qu'on vient d'injecter dans le conteneur
      container.querySelectorAll('.reveal').forEach(bloc => {
        window.revealObserver.observe(bloc);
      });
    } else {
      // Plan de secours au cas où le script de scroll charge après Supabase
      setTimeout(() => {
        if (window.revealObserver) {
          container.querySelectorAll('.reveal').forEach(bloc => window.revealObserver.observe(bloc));
        } else {
          // Si vraiment l'observateur n'est pas là, on affiche les blocs brute sans animation
          container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }
      }, 100);
    }

  } catch (err) {
    // Correction de la quote ici (utilisation de doubles guillemets pour entourer la chaîne)
    console.error("Erreur lors du chargement dynamique de l'État Civil:", err.message)
  }
}

/**
 * 4. Gestion de la page Gestion des Déchets
 */
async function initDechets() {
  const calContainer = document.getElementById('calendrier-target')
  const fichesContainer = document.getElementById('fiches-target')
  const orgContainer = document.getElementById('organismes-target')
  
  // Si on n'est pas sur la bonne page, on s'arrête
  if (!calContainer && !fichesContainer && !orgContainer) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'dechets_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const dechetsData = data.value

    // A. Rendu du Calendrier de collecte
    if (calContainer && dechetsData.calendrier) {
      const cal = dechetsData.calendrier
      calContainer.innerHTML = `
        <div class="calendrier-card reveal" style="margin-bottom: 3rem;">
          <div class="calendrier-preview-col pdf-preview-container">
            <canvas class="pdf-preview" data-pdf="${cal.pdf_url}"></canvas>
          </div>
          <div class="calendrier-info-col">
            <h3>${cal.title}</h3>
            <p>${cal.desc}</p>
            <a href="${cal.pdf_url}" class="btn btn-primary" target="_blank">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger le calendrier (PDF)
            </a>
          </div>
        </div>
      `
    }

    // B. Rendu de la Grille des fiches pratiques
    if (fichesContainer && dechetsData.fiches) {
      fichesContainer.innerHTML = ''
      dechetsData.fiches.forEach(fiche => {
        const card = document.createElement('a')
        card.href = fiche.pdf_url
        card.className = 'fiche-card reveal'
        card.target = '_blank'
        
        card.innerHTML = `
          <div class="fiche-preview pdf-preview-container">
            <canvas class="pdf-preview" data-pdf="${fiche.pdf_url}"></canvas>
          </div>
          <div class="fiche-body">
            <div class="fiche-header">
              <div class="fiche-color-dot ${fiche.color_dot}"></div>
              <div class="fiche-name">${fiche.name}</div>
            </div>
            <div class="fiche-desc">${fiche.desc}</div>
            <div class="fiche-dl">
              <svg width="13" height="13" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Fiche PDF
            </div>
          </div>
        `
        fichesContainer.appendChild(card)
      })
    }

    // C. Rendu de la Grille des organismes
    if (orgContainer && dechetsData.organismes) {
      orgContainer.innerHTML = ''
      dechetsData.organismes.forEach(org => {
        const orgCard = document.createElement('div')
        orgCard.className = 'organisme-card'
        orgCard.innerHTML = `
          <h3>${org.name}</h3>
          <p>${org.desc}</p>
          <a href="${org.url}" target="_blank" rel="noopener">${org.url.replace('https://', '')} →</a>
        `
        orgContainer.appendChild(orgCard)
      })
    }

    // D. Notification pour ton script de Preview PDF (Optionnel mais sécurisant)
    // Si ton script qui dessine le PDF dans le <canvas> écoute un événement pour se relancer :
    window.dispatchEvent(new Event('pdf-preview-reload'));

    // E. Ré-accroche des éléments injectés à ton IntersectionObserver global (.reveal)
    if (window.revealObserver) {
      if (calContainer) calContainer.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
      if (fichesContainer) fichesContainer.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
    } else {
      // Secours si l'observer global n'est pas encore instancié
      setTimeout(() => {
        const elements = document.querySelectorAll('#calendrier-target .reveal, #fiches-target .reveal');
        if (window.revealObserver) {
          elements.forEach(el => window.revealObserver.observe(el));
        } else {
          elements.forEach(el => el.classList.add('visible'));
        }
      }, 100);
    }

  } catch (err) {
    console.error("Erreur lors du chargement des données de gestion des déchets:", err.message)
  }
}