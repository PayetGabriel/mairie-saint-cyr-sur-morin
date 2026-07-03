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
  initVieQuotidienne()
  initTransports()
  initSallePolyvalente()
  initPLU()
  initPermisTravaux()
  initEauAssainissement()
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

    const dateTextSpan = document.getElementById('etat-civil-update-date')
    if (dateTextSpan && pageData.update_date) {
      dateTextSpan.textContent = `Mis à jour le ${pageData.update_date}`
    }

    container.innerHTML = ''

    pageData.sections_order.forEach(sectionKey => {
      const sData = pageData.sections[sectionKey]
      if (!sData) return

      const bloc = document.createElement('div')
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

    // Nettoyé grâce à la fonction globale
    bindNewReveals(container)

  } catch (err) {
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

    if (calContainer && dechetsData.calendrier) {
      const cal = dechetsData.calendrier
      
      const mainTitleEl = document.getElementById('calendrier-main-title')
      if (mainTitleEl && cal.main_title) {
          mainTitleEl.textContent = cal.main_title
      }

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

    window.dispatchEvent(new Event('pdf-preview-reload'));

    // Nettoyé grâce à la fonction globale sur les deux conteneurs concernés
    if (calContainer) bindNewReveals(calContainer)
    if (fichesContainer) bindNewReveals(fichesContainer)

  } catch (err) {
    console.error("Erreur lors du chargement des données de gestion des déchets:", err.message)
  }
}

/**
 * 5. Gestion de la page Vie Quotidienne (Coordonnées Utiles)
 */
async function initVieQuotidienne() {
  const container = document.getElementById('coords-target')
  if (!container) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'vie_quotidienne_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const coordsList = data.value
    container.innerHTML = ''

    coordsList.forEach(item => {
      const cleanNumber = item.number.replace(/\s+/g, '')
      const coordItem = document.createElement('div')
      coordItem.className = item.is_emergency ? 'coord-item urgence reveal' : 'coord-item reveal'
      
      coordItem.innerHTML = `
        <span class="coord-label">${item.name}</span>
        <a href="tel:${cleanNumber}" class="coord-tel">${item.number}</a>
      `
      container.appendChild(coordItem)
    })

    // Nettoyé grâce à la fonction globale
    bindNewReveals(container)

  } catch (err) {
    console.error("Erreur lors du chargement des coordonnées utiles:", err.message)
  }
}

/**
 * 6. Gestion de la page Transports (Grille des lignes de bus)
 */
async function initTransports() {
  const container = document.getElementById('transports-target')
  if (!container) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'transports_lignes_data')
      .single()

    if (error) throw error
    if (!data || !data.value || !data.value.lignes) return

    const listeLignes = data.value.lignes
    container.innerHTML = ''

    listeLignes.forEach(ligne => {
      const card = document.createElement('div')
      card.className = 'ligne-card reveal'
      
      card.innerHTML = `
        <div class="ligne-head">
          <div class="ligne-num">${ligne.id}</div>
          <div class="ligne-head-text">
            <strong>${ligne.name}</strong>
            <span>${ligne.dessert}</span>
          </div>
          <span class="ligne-badge ${ligne.badge_type}">${ligne.badge_label}</span>
        </div>
        <div class="ligne-plan">
          <img src="${ligne.img_url}" alt="Plan de la ligne ${ligne.id}" />
        </div>
        <div class="ligne-footer">
          <a href="${ligne.url}" target="_blank" rel="noopener">
            Horaires &amp; plan
            ${EXTERNAL_LINK_SVG}
          </a>
        </div>
      `
      container.appendChild(card)
    })

    // Nettoyé grâce à la fonction globale
    bindNewReveals(container)

  } catch (err) {
    console.error("Erreur lors du chargement des lignes de transport:", err.message)
  }
}

/**
 * 7. Gestion de la page Salle Polyvalente (Tarifs & Cautions)
 */
async function initSallePolyvalente() {
  const target = document.getElementById('salle-polyvalente-section')
  if (!target) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'salle_polyvalente_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const { tarifs, cautions } = data.value

    // Fonction utilitaire pour formater les prix (Ex: 57,50 € ou 180 €)
    const formatPrice = (num) => {
      return Number.isInteger(num) 
        ? `${num} €` 
        : `${num.toFixed(2).replace('.', ',')} €`;
    };

    // Remplissage des cellules dans les quatre tableaux
    target.querySelectorAll('tr[data-formule]').forEach(row => {
      const saison = row.getAttribute('data-saison');
      const cible = row.getAttribute('data-cible');
      const formule = row.getAttribute('data-formule');

      const basePrice = tarifs?.[saison]?.[cible]?.[formule];

      if (basePrice !== undefined) {
        const arrhes = basePrice * 0.25;
        const solde = basePrice * 0.75;

        row.querySelector('.price-main').textContent = formatPrice(basePrice);
        
        const subPrices = row.querySelectorAll('.price-sub');
        if (subPrices.length >= 2) {
          subPrices[0].textContent = formatPrice(arrhes);
          subPrices[1].textContent = formatPrice(solde);
        }
      }
    });

    // Remplissage des cautions
    if (cautions) {
      const elMenage = document.getElementById('caution-menage');
      const elMateriel = document.getElementById('caution-materiel');
      
      if (elMenage) elMenage.textContent = formatPrice(cautions.menage);
      if (elMateriel) elMateriel.textContent = formatPrice(cautions.materiel);
    }

  } catch (err) {
    console.error("Erreur lors du chargement des tarifs de la salle polyvalente:", err.message)
  }
}

/**
 * 8. Gestion de la page PLU (Urbanisme - Zones fixes & listes extensibles)
 */
async function initPLU() {
  const container = document.getElementById('plu-page-section')
  if (!container) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'plu_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const { zones, groups, applicable_date } = data.value

    // 1.5 Mise à jour de la date d'application du badge (évite le double espace)
    const dateBadgeSpan = document.getElementById('plu-applicable-date')
    if (dateBadgeSpan && applicable_date) {
      dateBadgeSpan.textContent = `Applicable depuis le ${applicable_date}`
    }

    // 1. Mise à jour des liens des 4 zones structurelles fixes
    if (zones) {
      Object.keys(zones).forEach(zoneKey => {
        const linkEl = container.querySelector(`a[data-zone="${zoneKey}"]`)
        if (linkEl) linkEl.href = zones[zoneKey] || '#'
      })
    }

    // 2. Génération dynamique de l'ensemble des groupes et sous-sections de documents
    const dynamicWrapper = document.getElementById('plu-dynamic-groups')
    if (dynamicWrapper && groups) {
      dynamicWrapper.innerHTML = ''

      groups.forEach(group => {
        // Ajout des en-têtes du groupe principal
        const headHTML = `
          <div class="section-label reveal" style="margin-top: 3rem; margin-bottom: 0.75rem;">${group.label}</div>
          <h2 class="section-title reveal" style="margin-bottom: 1.5rem;">${group.title}</h2>
        `
        const groupDiv = document.createElement('div')
        groupDiv.innerHTML = headHTML
        
        // Ajout de chaque sous-section de documents
        group.sections.forEach(section => {
          const sectionEl = document.createElement('div')
          sectionEl.className = 'docs-section reveal'
          
          let docsHTML = `<div class="docs-section-label">${section.section_label}</div>`
          docsHTML += `<div class="docs-list">`
          
          section.docs.forEach(doc => {
            docsHTML += `
              <a href="${doc.url}" target="_blank" rel="noopener" class="doc-item">
                <svg width="15" height="15" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                ${doc.label}
                <span class="doc-num">PDF</span>
              </a>
            `
          })
          
          docsHTML += `</div>`
          sectionEl.innerHTML = docsHTML
          groupDiv.appendChild(sectionEl)
        })

        dynamicWrapper.appendChild(groupDiv)
      })

      // Ré-attachement à l'IntersectionObserver pour les animations fluides
      bindNewReveals(dynamicWrapper)
    }

  } catch (err) {
    console.error("Erreur lors du chargement des données du PLU :", err.message)
  }
}

/**
 * 9. Gestion de la page Autorisations d'Urbanisme & Travaux
 */
async function initPermisTravaux() {
  // On vérifie la présence d'au moins un élément clé de la page avant de continuer
  if (!document.getElementById('voirie-btn-wrapper') && !document.getElementById('links-certificat')) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'permis_travaux_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // 1. Gestion du bouton Règlement de voirie
    const voirieWrapper = document.getElementById('voirie-btn-wrapper')
    if (voirieWrapper) {
      const rawUrl = pageData.voirie_document_url
      
      // Check absolu : si c'est null, vide, une grille (#) ou les textes "null"/"undefined"
      const isEmpty = !rawUrl || 
                      rawUrl.trim() === '' || 
                      rawUrl.trim() === '#' || 
                      rawUrl.trim() === 'null' || 
                      rawUrl.trim() === 'undefined'

      if (!isEmpty) {
        voirieWrapper.innerHTML = `
          <a href="${rawUrl.trim()}" class="btn-download" target="_blank" rel="noopener">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>Télécharger le document (PDF)</a>`.trim()
      } else {
        voirieWrapper.innerHTML = `
          <div class="btn-no-link">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4l3 3"></path>
            </svg>Document en cours de mise en ligne</div>`.trim()
      }
    }

    // Dictionnaire de configuration des types de liens (SVGs exacts + Texte du badge)
    const linkTypeConfig = {
      'service-public': {
        tag: 'Service-Public',
        svg: '<svg width="12" height="12" fill="none" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>'
      },
      'telecharger': {
        tag: 'Télécharger',
        svg: '<svg width="12" height="12" fill="none" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
      },
      'outil-en-ligne': {
        tag: 'Outil en ligne',
        svg: '<svg width="12" height="12" fill="none" stroke-width="2.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>'
      }
    }

    // Mapping entre les clés du JSON et les IDs des conteneurs HTML
    const cardMapping = {
      'certificat': 'links-certificat',
      'declaration': 'links-declaration',
      'construire': 'links-construire',
      'modificatif': 'links-modificatif',
      'transfert': 'links-transfert',
      'contestation': 'links-contestation',
      'fiscalite': 'links-fiscalite'
    }

    // 2. Injection dynamique des liens dans les 7 cartes
    if (pageData.cards_links) {
      Object.entries(cardMapping).forEach(([jsonKey, elementId]) => {
        const container = document.getElementById(elementId)
        if (!container) return

        const linksArray = pageData.cards_links[jsonKey] || []
        
        // Génération propre de chaque lien sans aucun espace parasite
        container.innerHTML = linksArray.map(link => {
          const config = linkTypeConfig[link.type] || linkTypeConfig['service-public']
          return `
            <a href="${link.url}" target="_blank" rel="noopener" class="demarche-link">
              ${config.svg}${link.label}<span class="tag">${config.tag}</span>
            </a>`.trim()
        }).join('\n')
      })
    }

  } catch (err) {
    console.error('Erreur lors du chargement des données de permis-travaux:', err)
  }
}

/**
 * 10. Gestion de la page Eau & Assainissement
 */
async function initEauAssainissement() {
  // On teste la présence d'un ID unique avant d'exécuter
  if (!document.getElementById('eau-prix-m3')) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'eau_assainissement_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // 1. Injection du prix de l'eau au m³
    const eauPrixSpan = document.getElementById('eau-prix-m3')
    if (eauPrixSpan && pageData.prix_eau_m3) {
      eauPrixSpan.textContent = pageData.prix_eau_m3
    }

    // 2. Injection des tarifs SPANC (Individuel)
    if (pageData.spanc_tarifs) {
      const spancMapping = {
        'visite': 'spanc-visite',
        'etude': 'spanc-etude',
        'chantier': 'spanc-chantier'
      }
      
      Object.entries(spancMapping).forEach(([jsonKey, elementId]) => {
        const el = document.getElementById(elementId)
        if (el && pageData.spanc_tarifs[jsonKey]) {
          el.textContent = pageData.spanc_tarifs[jsonKey]
        }
      })
    }

    // 3. Injection des tarifs PFAC (Collectif)
    if (pageData.pfac_tarifs) {
      const pfacMapping = {
        'neuf': 'pfac-neuf',
        'appartement': 'pfac-appartement',
        'copro_principal': 'pfac-copro-principal',
        'copro_supp': 'pfac-copro-supp'
      }

      Object.entries(pfacMapping).forEach(([jsonKey, elementId]) => {
        const el = document.getElementById(elementId)
        if (el && pageData.pfac_tarifs[jsonKey]) {
          el.textContent = pageData.pfac_tarifs[jsonKey]
        }
      })
    }

  } catch (err) {
    console.error('Erreur lors du chargement des données Eau & Assainissement:', err)
  }
}

/**
 * UTILS - Raccroche les nouveaux éléments du DOM à l'IntersectionObserver global (.reveal)
 * @param {HTMLElement} parentContainer - Le conteneur parent contenant les nouveaux éléments .reveal
 */
function bindNewReveals(parentContainer) {
  if (window.revealObserver) {
    parentContainer.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el))
  } else {
    setTimeout(() => {
      if (window.revealObserver) {
        parentContainer.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el))
      } else {
        parentContainer.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
      }
    }, 100)
  }
}