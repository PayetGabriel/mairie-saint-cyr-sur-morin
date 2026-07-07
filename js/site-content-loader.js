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
  const path = window.location.pathname;

  // À AJOUTER : Détection de la page d'accueil
  if (path === '/' || path === '/index.html' || path.endsWith('/')) {
    initHomeArticles();
  }
  
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
  initSivuInfos()
  initScolaritePeriscolaire()
  initTransportsEtudes()
  initCantine()
  initInscriptions()
  initSivuPracticalDocs()
  initComptesRendus()
  initArretes()
  initTraitsUnion()
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
 * 11. Gestion de la page SIVU - Infos (Enfance & Loisirs)
 */
async function initSivuInfos() {
  if (!document.getElementById('sivu-update-badge') && !document.getElementById('sivu-intervenants-wrapper')) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'sivu_infos_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // 1. Badge de révision
    const updateBadge = document.getElementById('sivu-update-badge')
    if (updateBadge && pageData.updated_at) {
      updateBadge.innerHTML = `
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>Mis à jour le ${pageData.updated_at}`.trim()
    }

    // 2. Le Bureau
    if (pageData.bureau) {
      if (pageData.bureau.president) {
        document.getElementById('bureau-pres-name').textContent = pageData.bureau.president.name
        document.getElementById('bureau-pres-info').textContent = pageData.bureau.president.info
      }
      if (pageData.bureau.vice_president) {
        document.getElementById('bureau-vp-name').textContent = pageData.bureau.vice_president.name
        document.getElementById('bureau-vp-info').textContent = pageData.bureau.vice_president.info
      }
    }

    // 3. Tableaux des communes
    if (pageData.communes) {
      const renderCommune = (key, listId, countId) => {
        const container = document.getElementById(listId)
        const countSpan = document.getElementById(countId)
        if (!container || !pageData.communes[key]) return

        const { titulaires = [], suppleants = [] } = pageData.communes[key]
        const totalDelegues = titulaires.length + 1
        
        if (countSpan) {
          countSpan.textContent = `${totalDelegues} délégué${totalDelegues > 1 ? 's' : ''}`
        }

        const htmlTitulaires = titulaires.map(name => `
          <div class="personnel-card-mini">
            <div class="mini-name">${name} <span class="badge-status">Titulaire</span></div>
          </div>`).join('')

        const htmlSuppleants = suppleants.map(name => `
          <div class="personnel-card-mini suppleant">
            <div class="mini-name">${name} <span class="badge-status sp">Suppléante</span></div>
          </div>`).join('')

        container.innerHTML = (htmlTitulaires + htmlSuppleants).trim()
      }

      renderCommune('saint_cyr', 'list-cyr', 'count-cyr')
      renderCommune('saint_ouen', 'list-ouen', 'count-ouen')
    }

    // 4. Section des intervenants + FIX REVEAL
    const intervenantsWrapper = document.getElementById('sivu-intervenants-wrapper')
    if (intervenantsWrapper && pageData.intervenants) {
      intervenantsWrapper.innerHTML = pageData.intervenants.map(sec => {
        const itemsHtml = sec.names.map(name => `<div class="personnel-item">${name}</div>`).join('\n        ')
        return `
          <div class="personnel-section reveal">
            <h3 class="personnel-section-title">${sec.category}</h3>
            <div class="personnel-list">
              ${itemsHtml}
            </div>
          </div>`.trim()
      }).join('\n\n    ')

      // FIX : On raccroche les nouveaux éléments .reveal au IntersectionObserver global
      bindNewReveals(intervenantsWrapper)
    }

  } catch (err) {
    console.error('Erreur lors du chargement des données SIVU:', err)
  }
}

/**
 * 12. Gestion de la page Scolarité et Périscolaire (Vie Locale + Cross data SIVU)
 */
async function initScolaritePeriscolaire() {
  const badge = document.getElementById('scolarite-update-badge')
  if (!badge) return

  try {
    // Appel simultané des deux sources de données distinctes
    const [resVieLocale, resSivu] = await Promise.all([
      supabase.from('site_content').select('value').eq('key', 'scolarite_periscolaire_data').single(),
      supabase.from('site_content').select('value').eq('key', 'transports_etudes_data').single()
    ])

    if (resVieLocale.error) throw resVieLocale.error
    const localData = resVieLocale.data?.value
    const sivuData = resSivu.data?.value // Optionnel s'il n'est pas encore créé

    if (!localData) return

    // 1. Mise à jour du badge de révision
    if (localData.updated_at) {
      badge.innerHTML = `
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>Mis à jour le ${localData.updated_at}`.trim()
    }

    // 2. Traitement des cartes Écoles (Maternelle & Élémentaire)
    if (localData.ecoles) {
      const { maternelle, elementaire } = localData.ecoles
      
      if (maternelle) {
        document.getElementById('card-maternelle').innerHTML = `
          <div class="periscolaire-card-head">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg><span>Maternelle</span>
          </div>
          <div class="periscolaire-card-body">
            <h4>${maternelle.title}</h4>
            <p style="margin-bottom: 0.5rem;">${maternelle.adresse}</p>
            <p><strong>${maternelle.role_titre || 'Directrice'} :</strong> ${maternelle.name}</p>
            <p style="margin-top: 0.8rem;">
              <a href="tel:${maternelle.tel}" style="color: var(--vert); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${maternelle.tel_formated}
              </a>
            </p>
          </div>`.trim()
      }

      if (elementaire) {
        document.getElementById('card-elementaire').innerHTML = `
          <div class="periscolaire-card-head">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg><span>Élémentaire</span>
          </div>
          <div class="periscolaire-card-body">
            <h4>${elementaire.title}</h4>
            <p style="margin-bottom: 0.5rem;">${elementaire.adresse}</p>
            <p><strong>${elementaire.role_titre || 'Directrice'} :</strong> ${elementaire.name}</p>
            <p style="margin-top: 0.8rem;">
              <a href="tel:${elementaire.tel}" style="color: var(--vert); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${elementaire.tel_formated}
              </a>
            </p>
          </div>`.trim()
      }
    }

    // 3. Carte Familles Rurales
    if (localData.familles_rurales) {
      const fr = localData.familles_rurales
      document.getElementById('card-familles-rurales').innerHTML = `
        <div class="periscolaire-card-head">
          <svg width="16" height="16" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <span>Familles Rurales</span>
        </div>
        <div class="periscolaire-card-body">
          <h4>Accueil de loisirs (St Cyr / St Ouen)</h4>
          <p>${fr.adresse} — ${fr.description}</p>
          <p><strong>Périscolaire :</strong> ${fr.horaires_perisco}</p>
          <p><strong>Mercredis et vacances scolaires :</strong> ${fr.horaires_mercredis_vacances}</p>
          <p>${fr.infos_tarifs} Rens. : <a href="tel:${fr.tel}">${fr.tel_formated}</a></p>
        </div>`.trim()
    }

    // 4. Carte Études Surveillées (CROISEMENT - Source SIVU)
    const cardEtudes = document.getElementById('card-etudes-surveillees')
    if (cardEtudes) {
      if (sivuData && sivuData.etudes_surveillees) {
        const es = sivuData.etudes_surveillees
        cardEtudes.innerHTML = `
          <div class="periscolaire-card-head">
            <svg width="16" height="16" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>Élémentaire</span>
          </div>
          <div class="periscolaire-card-body">
            <h4>Étude surveillée — ${es.etablissement}</h4>
            <p>Les <strong>${es.jours}</strong> de ${es.horaires}.</p>
            <p>${es.inscription_details}</p>
            <p><strong>Tarif : ${es.tarif}</strong></p>
            <p>${es.pedibus_details}</p>
          </div>`.trim()
      } else {
        cardEtudes.innerHTML = `<p style="padding:1.5rem; color:var(--gris);">Données d'étude indisponibles (en attente SIVU).</p>`
      }
    }

    // 5. Rendu des lignes de Transports Scolaires
    if (localData.transports_scolaires) {
      const renderLignes = (lignesArray, targetId) => {
        const wrapper = document.getElementById(targetId)
        if (!wrapper || !lignesArray) return
        
        wrapper.innerHTML = lignesArray.map(ligne => `
          <div class="ligne-card">
            <div class="ligne-head">
              <div class="ligne-num">${ligne.id}</div>
              <div class="ligne-head-text">
                <strong>${ligne.name}</strong>
                <span>${ligne.dessert}</span>
              </div>
              <span class="ligne-badge scolaire">Scolaire</span>
            </div>
            <div class="ligne-plan">
              <img src="${ligne.img_url}" alt="Plan de la ligne ${ligne.id}" />
            </div>
            <div class="ligne-footer">
              <a href="${ligne.url}" target="_blank" rel="noopener">
                Horaires &amp; plan
                <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            </div>
          </div>`.trim()).join('\n')
      }

      renderLignes(localData.transports_scolaires.la_ferte_villeneuve, 'wrapper-transports-la-ferte')
      renderLignes(localData.transports_scolaires.coulommiers, 'wrapper-transports-coulommiers')
    }

    // Raccrocher les conteneurs d'injection au reveal global
    const mainSection = document.getElementById('card-maternelle').closest('.section')
    if (mainSection) bindNewReveals(mainSection)
    
    const transportSection = document.getElementById('wrapper-transports-la-ferte').closest('.section')
    if (transportSection) bindNewReveals(transportSection)

  } catch (err) {
    console.error("Erreur d'initialisation de la page Scolarité :", err)
  }
}

/**
 * 13. Gestion des Transports Scolaires et Études Surveillées
 */
async function initTransportsEtudes() {
  const lignesContainer = document.getElementById('transports-lignes-container')
  if (!lignesContainer) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'transports_etudes_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // --- 1. RENDU DES DOCUMENTS DES TRANSPORTS ---
    const docsContainer = document.getElementById('transports-docs-container')
    if (docsContainer && pageData.transports_scolaires?.documents) {
      docsContainer.innerHTML = pageData.transports_scolaires.documents.map(doc => {
        const btnClass = doc.primary ? 'btn btn-primary' : 'btn btn-outline'
        return `
          <a href="${doc.url}" class="${btnClass}" target="_blank" rel="noopener">
            ${DOWNLOAD_SVG}
            ${doc.label}
          </a>`.trim()
      }).join('\n')
    }

    // --- 2. RENDU DES LIGNES ET HORAIRES DE BUS ---
    if (pageData.transports_scolaires?.lignes) {
      lignesContainer.innerHTML = pageData.transports_scolaires.lignes.map((ligne, index) => {
        
        // Gestion de la note de correspondance optionnelle
        const noteHtml = ligne.note ? `
          <p style="font-size: 0.8rem; color: var(--gris); font-style: italic; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 5px; line-height: 1.4;">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-top: 2px; flex-shrink: 0;">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6"/>
            </svg>
            ${ligne.note}
          </p>`.trim() : ''

        // Générateur de lignes de tableau (Matin / Soir)
        const renderTableRows = (stopsArray) => {
          return stopsArray.map(stop => {
            let badgeHtml = ''
            if (stop.badge) {
              const iconHtml = stop.icon === 'link' ? ` ${EXTERNAL_LINK_SVG}` : ''
              badgeHtml = ` <span style="font-size: 0.75rem; color: var(--gris); font-weight: normal; display: inline-flex; align-items: center; gap: 0.25rem;">(${stop.badge})${iconHtml}</span>`
            }
            return `<tr><td>${stop.heure}</td><td>${stop.arret}${badgeHtml}</td></tr>`
          }).join('')
        }

        // Pour éviter un marginTop inutile sur la toute première ligne injectée
        const topMargin = index === 0 ? '1rem' : '3.5rem'

        return `
          <div class="content-block reveal" style="margin-top: ${topMargin};">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 0.3rem; color: var(--vert);">
                  Ligne ${ligne.numero} — ${ligne.nom}
              </h3>
              <p style="font-size: 0.9rem; color: var(--vert-clair); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 5px;">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity: 0.7;">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Surveillance : ${ligne.surveillance}
              </p>
              ${noteHtml}
          </div>
          
          <div class="horaires-grid reveal">
            <div class="horaire-table">
              <h4><strong>Matin :</strong> Lundi, mardi, jeudi, vendredi</h4>
              <table>
                <thead>
                  <tr><th>Heure</th><th>Points d'arrêts</th></tr>
                </thead>
                <tbody>
                  ${renderTableRows(ligne.matin)}
                </tbody>
              </table>
            </div>
            
            <div class="horaire-table">
              <h4><strong>Soir :</strong> Lundi, mardi, jeudi, vendredi</h4>
              <table>
                <thead>
                  <tr><th>Heure</th><th>Points d'arrêts</th></tr>
                </thead>
                <tbody>
                  ${renderTableRows(ligne.soir)}
                </tbody>
              </table>
            </div>
          </div>`.trim()
      }).join('\n')
    }

    // --- 3. RENDU DES INFOS DE L'ÉTUDE ---
    const etudesList = document.getElementById('etudes-details-list')
    const etudesDocContainer = document.getElementById('etudes-doc-container')
    
    if (pageData.etudes_surveillees) {
      const es = pageData.etudes_surveillees

      if (etudesList) {
        etudesList.innerHTML = `
          <li>Elle a lieu <strong>deux fois par semaine</strong> les ${es.jours} de <strong>${es.horaires}</strong> à l'${es.etablissement}.</li>
          <li>${es.pedibus_details}</li>
          <li><strong>Tarif :</strong> ${es.tarif} d'inscription</li>
          <li><strong>Mode d'inscription :</strong> ${es.inscription_details}</li>
        `.trim()
      }

      if (etudesDocContainer && es.reglement_url) {
        etudesDocContainer.innerHTML = `
          <a href="${es.reglement_url}" class="doc-card" target="_blank" rel="noopener noreferrer">
            <svg width="28" height="28" fill="none" stroke="var(--vert)" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <div class="doc-info">
              <strong>Règlement intérieur de l'étude</strong>
              <span>PDF — À télécharger</span>
            </div>
          </a>`.trim()
      }
    }

    // --- 4. RELANCER L'INTERSECTION OBSERVER ---
    // On cible le parent le plus proche qui englobe toutes nos modifications pour rafraîchir les transitions CSS .reveal
    const parentSection = lignesContainer.closest('.section-inner')
    if (parentSection) {
      bindNewReveals(parentSection)
    }
    const transportDocsSection = docsContainer?.closest('.section-inner')
    if (transportDocsSection) {
      bindNewReveals(transportDocsSection)
    }

  } catch (err) {
    console.error("Erreur lors du chargement des transports et des études :", err.message)
  }
}

/**
 * 14. Gestion de la Cantine Scolaire (Menus & Tarifs)
 */
async function initCantine() {
  const menusContainer = document.getElementById('cantine-menus-container')
  if (!menusContainer) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'cantine_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // --- 1. RENDU DES MENUS (GRILLE DE CARTES DE DOCUMENT) ---
    if (pageData.menus) {
      menusContainer.innerHTML = pageData.menus.map(menu => `
        <a href="${menu.url}" class="doc-card" target="_blank" rel="noopener noreferrer">
          <svg width="28" height="28" fill="none" stroke="var(--vert)" stroke-width="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <div class="doc-info">
            <strong>${menu.title}</strong>
            <span>${menu.subtitle}</span>
          </div>
        </a>`.trim()).join('\n')
    }

    // --- 2. RENDU DES TARIFS (BLOC COMPLEXE AVEC HISTORIQUE / ANNÉE) ---
    const tarifsBox = document.getElementById('cantine-tarifs-box')
    if (tarifsBox && pageData.tarifs) {
      const t = pageData.tarifs
      
      const itemsHtml = (t.items || []).map(item => `
        <div class="tarif-item">
          <strong>${item.price}</strong>
          <span>${item.label}</span>
        </div>`.trim()).join('\n')

      tarifsBox.innerHTML = `
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-top: 25px; margin-bottom: 0.5rem; color: var(--vert);">
          Tarifs ${t.annee}
        </h3>
        ${itemsHtml}
        <p style="font-size: .85rem; color: var(--gris); margin-top: 1rem;">
          ${t.note}
        </p>
      `.trim()
    }

    // --- 3. RENDU DU BOUTON RÈGLEMENT INTÉRIEUR ---
    const reglementContainer = document.getElementById('cantine-reglement-container')
    if (reglementContainer && pageData.reglement) {
      reglementContainer.innerHTML = `
        <a href="${pageData.reglement.url}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          ${pageData.reglement.label}
        </a>`.trim()
    }

    // --- 4. RELANCER L'INTERSECTION OBSERVER POUR LES EFFETS .REVEAL ---
    const parentMenus = menusContainer.closest('.section-inner')
    if (parentMenus) bindNewReveals(parentMenus)

    if (tarifsBox) {
      const parentTarifs = tarifsBox.closest('.section-inner')
      if (parentTarifs) bindNewReveals(parentTarifs)
    }

    const parentReglement = reglementContainer?.closest('.section-inner')
    if (parentReglement) bindNewReveals(parentReglement)

  } catch (err) {
    console.error("Erreur lors du chargement des données de la cantine :", err.message)
  }
}

/**
 * 15. Gestion des Documents d'Inscriptions Scolaires
 */
async function initInscriptions() {
  const cantineDocsContainer = document.getElementById('inscriptions-cantine-container')
  const etudeDocsContainer = document.getElementById('inscriptions-etude-container')
  
  // On s'assure d'être sur la bonne page avant de requêter Supabase
  if (!cantineDocsContainer && !etudeDocsContainer) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'inscriptions_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    // Fonction template réutilisable pour générer une carte de document
    const renderDocCards = (docsArray) => {
      if (!docsArray) return ''
      return docsArray.map(doc => {
        // Si l'URL est une ancre vide #, on ne met pas les attributs de nouvel onglet
        const isExternal = doc.url && doc.url !== '#'
        const attributes = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
        
        return `
          <a href="${doc.url}" class="doc-card" ${attributes}>
            <svg width="28" height="28" fill="none" stroke="var(--vert)" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <div class="doc-info">
              <strong>${doc.title}</strong>
              <span>${doc.subtitle}</span>
            </div>
          </a>`.trim()
      }).join('\n')
    }

    // --- 1. RENDU DES DOCUMENTS DE LA CANTINE ---
    if (cantineDocsContainer && pageData.cantine_docs) {
      cantineDocsContainer.innerHTML = renderDocCards(pageData.cantine_docs)
    }

    // --- 2. RENDU DES DOCUMENTS DE L'ÉTUDE ---
    if (etudeDocsContainer && pageData.etude_docs) {
      etudeDocsContainer.innerHTML = renderDocCards(pageData.etude_docs)
    }

    // --- 3. RELANCER L'INTERSECTION OBSERVER POUR LES TRANSITIONS CSS ---
    if (cantineDocsContainer) {
      const parentCantine = cantineDocsContainer.closest('.section-inner')
      if (parentCantine) bindNewReveals(parentCantine)
    }

    if (etudeDocsContainer) {
      const parentEtude = etudeDocsContainer.closest('.section-inner')
      if (parentEtude) bindNewReveals(parentEtude)
    }

  } catch (err) {
    console.error("Erreur lors du chargement des documents d'inscriptions :", err.message)
  }
}

/**
 * 16. Gestion des Documents Pratiques du SIVU (Page Accueil SIVU)
 */
async function initSivuPracticalDocs() {
  const docsContainer = document.getElementById('sivu-practical-docs-container')
  if (!docsContainer) return

  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'sivu_practical_data')
      .single()

    if (error) throw error
    if (!data || !data.value) return

    const pageData = data.value

    if (pageData.docs) {
      docsContainer.innerHTML = pageData.docs.map(doc => {
        const isExternal = doc.url && doc.url !== '#'
        const attributes = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
        
        return `
          <a href="${doc.url}" class="doc-card" ${attributes}>
            <svg width="28" height="28" fill="none" stroke="var(--vert)" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <div class="doc-info">
              <strong>${doc.title}</strong>
              <span>${doc.subtitle}</span>
            </div>
          </a>`.trim()
      }).join('\n')
    }

    // Relancer l'Intersection Observer pour préserver les effets .reveal
    const parentSection = docsContainer.closest('.section-inner')
    if (parentSection) bindNewReveals(parentSection)

  } catch (err) {
    console.error("Erreur lors du chargement des documents pratiques du SIVU :", err.message)
  }
}

/**
 * 17. Gestion de la section Comptes-Rendus du Conseil Municipal
 * Regroupe dynamiquement les séances par année, calcule leur nombre et génère des cartes cliquables.
 */
async function initComptesRendus() {
  const container = document.getElementById('comptes-rendus-container')
  if (!container) return

  try {
    // Récupération des comptes-rendus publiés, triés par date décroissante
    const { data, error } = await supabase
      .from('comptes_rendus')
      .select('*')
      .eq('is_draft', false)
      .order('date_conseil', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      container.innerHTML = `<p style="font-size: 0.88rem; color: var(--gris); font-style: italic;">Aucun compte-rendu disponible pour le moment.</p>`
      return
    }

    // Regroupement des données par année
    const groups = {}
    data.forEach(cr => {
      // Extraction sécurisée de l'année depuis la chaîne 'YYYY-MM-DD'
      const year = cr.date_conseil.split('-')[0]
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(cr)
    })

    // Tri des années par ordre décroissant
    const years = Object.keys(groups).sort((a, b) => b - a)

    // Formateur natif pour l'affichage de la date en français (ex: 2 juin 2025)
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    let htmlContent = ''

    years.forEach(year => {
      const items = groups[year]
      const seancesCount = items.length
      const seanceText = seancesCount > 1 ? 'séances' : 'séance'

      htmlContent += `
      <div class="cr-annee-bloc reveal">
        <div class="cr-annee-label">${year} <span>${seancesCount} ${seanceText}</span></div>
        <div class="cr-grid">
      `

      items.forEach(cr => {
        // Découpage pour forcer l'interprétation locale de la date et éviter les décalages de fuseaux horaires
        const [yyyy, mm, dd] = cr.date_conseil.split('-')
        const localDate = new Date(yyyy, mm - 1, dd)
        const formattedDate = dateFormatter.format(localDate)

        // Génération de la carte sous forme de lien hypertexte direct vers le PDF hébergé
        htmlContent += `
          <a href="${cr.document_url || '#'}" target="_blank" rel="noopener noreferrer" class="cr-card">
            <svg width="14" height="14" fill="none" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <div class="cr-card-text">
              <div class="cr-card-date">${formattedDate}</div>
            </div>
          </a>
        `
      })

      htmlContent += `
        </div>
      </div>
      `
    })

    // Injection du HTML complet construit d'un seul coup
    container.innerHTML = htmlContent

    // Raccrocher les nouveaux éléments injectés à l'IntersectionObserver pour les animations .reveal
    const parentSection = container.closest('.tab-pane') || container.closest('.section')
    if (parentSection && typeof bindNewReveals === 'function') {
      bindNewReveals(parentSection)
    }

  } catch (err) {
    console.error("Erreur lors du chargement dynamique des comptes-rendus :", err.message)
  }
}

/**
 * 18. Gestion des Arrêtés Municipaux
 */
async function initArretes() {
  const container = document.getElementById('arretes-wrapper')
  if (!container) return

  try {
    // Récupération des arrêtés non-brouillons triés du plus récent au plus ancien
    const { data, error } = await supabase
      .from('arretes')
      .select('*')
      .eq('is_draft', false)
      .order('en_vigueur_le', { ascending: false })

    if (error) throw error

    // Fonction utilitaire locale pour formater les dates à la française (ex: 15 janvier 2026)
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    // ÉCRAN 1 : Si la table est vide ou s'il n'y a que des brouillons
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-state reveal">
          <svg width="48" height="48" fill="none" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <h3>Aucun arrêté en vigueur</h3>
          <p>Il n'y a pas d'arrêté municipal en vigueur actuellement. Cette page sera mise à jour lors de la publication de nouveaux arrêtés.</p>
          <a href="/contact.html" class="btn btn-outline">
            Contacter la mairie
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        </div>
      `
    } else {
      // ÉCRAN 2 : Si au moins un arrêté publié existe
      container.innerHTML = `
        <div class="reveal" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${data.map(arrete => `
            <a href="${arrete.document_url}" target="_blank" class="arrete-card">
              <div class="arrete-num">${arrete.numero}</div>
              <div class="arrete-info">
                <div class="arrete-title">${arrete.titre}</div>
                <div class="arrete-date">Pris le ${formatDate(arrete.pris_le)} — En vigueur le ${formatDate(arrete.en_vigueur_le)}</div>
              </div>
              <div class="arrete-pdf">
                <svg width="13" height="13" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Consulter
              </div>
            </a>
          `).join('\n')}
        </div>
      `
    }

    // Relancer l'Intersection Observer pour préserver les effets d'apparition .reveal
    bindNewReveals(container)

  } catch (err) {
    console.error("Erreur lors du chargement des arrêtés municipaux :", err.message)
  }
}

/**
 * 19. Gestion des Bulletins Municipaux (Le Trait d'Union)
 */
async function initTraitsUnion() {
  const archivesContainer = document.getElementById('tu-archives-container')
  if (!archivesContainer) return

  const badgeElement = document.getElementById('tu-update-badge')
  const dateElement = document.getElementById('tu-update-date')
  const featuredContainer = document.getElementById('tu-featured-container')

  try {
    // Récupération de tous les bulletins ordonnés par date décroissante
    const { data, error } = await supabase
      .from('traits_union')
      .select('*')
      .eq('is_draft', false)
      .order('date_publication', { ascending: false })

    if (error) throw error
    if (!data || data.length === 0) return

    // --- 1. Gestion du badge de mise à jour ---
    const latestDate = new Date(data[0].date_publication)
    if (dateElement && badgeElement) {
      const formattedLatest = latestDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      dateElement.textContent = `Mis à jour le ${formattedLatest}`
      badgeElement.style.display = 'inline-flex'
    }

    // --- 2. Formateur de dates local (gère les cas historiques spécifiques) ---
    const formatTuDate = (dateStr) => {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = date.getMonth() // 0-11

      // Interceptions spécifiques pour respecter scrupuleusement les archives d'origine
      if (year === 2016 && month === 10) return "Nov. – Déc. 2016"
      if (year === 2016 && month === 8)  return "Sept. – Oct. 2016"
      if (year === 2015 && month === 7)  return "Août – Sept. 2015"
      if (year === 2015 && month === 4)  return "Mai – Juin 2015"

      const standardLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      return standardLabel.charAt(0).toUpperCase() + standardLabel.slice(1)
    }

    // --- 3. Gestion de la mise en avant (Dernier numéro) ---
    const featured = data[0]
    if (featuredContainer) {
      const isSpecial = featured.type_special !== 'Standard'
      const titleDisplay = isSpecial ? featured.type_special : `Trait d'Union<br>n°${featured.numero}`
      
      featuredContainer.innerHTML = `
        <div class="section-label reveal" style="margin-bottom: 0.75rem;">Dernier numéro</div>
        <div class="tu-une reveal">
          <div class="tu-une-cover">
            <canvas class="pdf-preview" data-pdf="${featured.document_url}"></canvas>
          </div>
          <div class="tu-une-body">
            <div class="tu-une-label">${isSpecial ? 'Édition Spéciale' : 'Bulletin municipal'}</div>
            <div class="tu-une-title">${titleDisplay}</div>
            <div class="tu-une-date">${formatTuDate(featured.date_publication)}</div>
            <a href="${featured.document_url}" target="_blank" class="btn btn-primary">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Consulter ce numéro
            </a>
          </div>
        </div>
      `
    }

    // --- 4. Groupement automatique des archives par Année ---
    const groupsByYear = {}
    data.forEach(item => {
      const year = new Date(item.date_publication).getFullYear()
      if (!groupsByYear[year]) groupsByYear[year] = []
      groupsByYear[year].push(item)
    })

    // Tri des années du plus récent au plus ancien
    const sortedYears = Object.keys(groupsByYear).sort((a, b) => b - a)

    // Construction dynamique du code HTML des accordions
    let htmlContent = ""
    sortedYears.forEach((year, index) => {
      const items = groupsByYear[year]
      
      // Calcul du badge de description de l'accordéon
      const standardCount = items.filter(i => i.type_special === 'Standard').length
      const hasHorsSerie = items.some(i => i.type_special === 'Hors-Série')
      const hasSupplement = items.some(i => i.type_special === 'Supplément')

      let badgeLabel = `${standardCount} numéro${standardCount > 1 ? 's' : ''}`
      if (hasHorsSerie) badgeLabel += ' + hors-série'
      if (hasSupplement) badgeLabel += ' + supplément'

      // Le premier accordéon (année en cours) reste ouvert par défaut via l'attribut 'open'
      const isOpen = index === 0 ? 'open' : ''

      htmlContent += `
        <details class="tu-annee-accordion reveal" ${isOpen}>
          <summary class="tu-annee-summary">
            <div class="tu-summary-left">
              ${year} <span class="tu-badge">${badgeLabel}</span>
            </div>
            <svg width="14" height="14" fill="none" stroke-width="2.5" viewBox="0 0 24 24" class="tu-chevron">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </summary>
          <div class="tu-annee-content">
            <div class="tu-annee-grid">
              ${items.map(tdu => {
                const isSpecial = tdu.type_special !== 'Standard'
                const cardClass = isSpecial ? 'tu-card special' : 'tu-card'
                const numDisplay = isSpecial ? tdu.type_special : `Trait d'Union n°${tdu.numero}`

                return `
                  <a href="${tdu.document_url}" target="_blank" class="card-link">
                    <div class="${cardClass}"> <div class="tu-card-cover">
                        <canvas class="pdf-preview" data-pdf="${tdu.document_url}"></canvas>
                      </div>
                      <div class="tu-card-body">
                        <div class="tu-card-num">${numDisplay}</div>
                        <div class="tu-card-date">${formatTuDate(tdu.date_publication)}</div>
                        <div class="tu-card-btn">
                          <svg width="11" height="11" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                          Consulter
                        </div>
                      </div>
                    </div>
                  </a>
                `
              }).join('\n')}
            </div>
          </div>
        </details>
      `
    })

    archivesContainer.innerHTML = htmlContent

    // Relance de l'Observer d'apparition pour les nouveaux blocs injectés
    const parentSection = archivesContainer.closest('.section')
    if (parentSection) bindNewReveals(parentSection)

    // Déclenchement de l'événement personnalisé pour activer l'observer sur les nouveaux canvas
    window.dispatchEvent(new Event('pdf-preview-reload'));

  } catch (err) {
    console.error("Erreur lors de l'initialisation des bulletins Trait d'Union :", err.message)
  }
}

/**
 * Initialise les articles de la page d'accueil (Carousel et Dernières actualités)
 */
export async function initHomeArticles() {
  // 1. Récupération parallèle des articles (Carousel mis en avant vs 5 derniers articles)
  const [featuredRes, latestRes] = await Promise.all([
    supabase.from('articles').select('*').eq('is_draft', false).eq('is_featured', true).order('created_at', { ascending: false }),
    supabase.from('articles').select('*').eq('is_draft', false).order('created_at', { ascending: false }).limit(5)
  ]);

  // 2. Rendu et activation du Carousel
  if (!featuredRes.error && featuredRes.data && featuredRes.data.length > 0) {
    renderHomeCarousel(featuredRes.data);
  } else {
    const carouselSec = document.querySelector('.carousel-section');
    if (carouselSec) carouselSec.style.display = 'none';
  }

  // 3. Rendu de la grille des 5 dernières actualités
  if (!latestRes.error && latestRes.data && latestRes.data.length > 0) {
    renderHomeLatestArticles(latestRes.data);
  }
}

function renderHomeCarousel(slidesData) {
  const track = document.querySelector('.carousel-track');
  const dotsContainer = document.querySelector('.carousel-dots');
  if (!track || !dotsContainer) return;

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  slidesData.forEach((item) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const imgUrl = item.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

    slide.innerHTML = `
      <div class="carousel-text">
        <span class="actu-tag">${item.tag}</span>
        <h3>${item.titre}</h3>
        <p>${item.resume || ''}</p>
        <a href="/la-commune/actualites/article.html?id=${item.id}" class="carousel-link">En savoir plus →</a>
      </div>
      <div class="carousel-img" style="background-image:url('${imgUrl}')"></div>
    `;
    track.appendChild(slide);
  });

  const slides = track.querySelectorAll('.carousel-slide');
  let current = 0, timer;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });

  function fixHeight() {
    track.style.height = '';
    slides.forEach(s => {
      s.style.position = 'relative'; s.style.opacity = '1'; s.style.pointerEvents = 'auto'; s.style.height = 'auto';
    });
    const maxH = Math.max(...Array.from(slides).map(s => s.offsetHeight));
    track.style.height = maxH + 'px';
    slides.forEach(s => {
      s.style.position = ''; s.style.opacity = ''; s.style.pointerEvents = ''; s.style.height = maxH + 'px';
    });
  }

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsContainer.querySelectorAll('.carousel-dot')[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.querySelectorAll('.carousel-dot')[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  document.querySelector('.carousel-prev').addEventListener('click', () => goTo(current - 1));
  document.querySelector('.carousel-next').addEventListener('click', () => goTo(current + 1));

  slides[0].classList.add('active');
  resetTimer();

  if (document.readyState === 'complete') { fixHeight(); } 
  else { window.addEventListener('load', fixHeight); }
  window.addEventListener('resize', fixHeight);
  
  if (typeof bindNewReveals === 'function') {
    document.querySelectorAll('.carousel-section .reveal').forEach(el => bindNewReveals(el.parentElement || el));
  }
}

function renderHomeLatestArticles(articles) {
  const gridContainer = document.querySelector('#actualites .actu-grid');
  if (!gridContainer) return;

  const mainArticle = articles[0];
  const mainImgUrl = mainArticle.image_url || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80';
  
  let listHTML = '';
  const listArticles = articles.slice(1);
  
  listArticles.forEach((item, index) => {
    const displayNum = String(index + 1).padStart(2, '0');
    // Utilise la fonction formatDate globale déjà présente dans ton fichier
    const dateStr = typeof formatDate === 'function' ? formatDate(item.created_at) : new Date(item.created_at).toLocaleDateString('fr-FR');
    
    listHTML += `
      <a href="/la-commune/actualites/article.html?id=${item.id}" class="actu-item">
        <div class="actu-item-num">${displayNum}</div>
        <div class="actu-item-body">
          <div class="actu-item-title">${item.titre}</div>
          <div class="actu-item-date">${dateStr} — ${item.tag}</div>
        </div>
      </a>
    `;
  });

  const mainDateStr = typeof formatDate === 'function' ? formatDate(mainArticle.created_at) : new Date(mainArticle.created_at).toLocaleDateString('fr-FR');

  gridContainer.innerHTML = `
    <a href="/la-commune/actualites/article.html?id=${mainArticle.id}" class="actu-main">
      <div class="actu-main-img" style="background: url('${mainImgUrl}') center/cover;"></div>
      <div class="actu-main-body">
        <span class="actu-tag">${mainArticle.tag}</span>
        <div class="actu-main-title">${mainArticle.titre}</div>
        <p class="actu-main-text">${mainArticle.resume || ''}</p>
        <div class="actu-date">${mainDateStr}</div>
      </div>
    </a>
    <div class="actu-list">
      ${listHTML}
    </div>
  `;

  if (typeof bindNewReveals === 'function') {
    gridContainer.querySelectorAll('.reveal').forEach(el => bindNewReveals(el));
    const parentReveal = gridContainer.closest('.reveal') || gridContainer;
    bindNewReveals(parentReveal);
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