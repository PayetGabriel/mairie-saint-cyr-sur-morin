import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://eyjooultejiibshzvztm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5am9vdWx0ZWppaWJzaHp2enRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjkzMDksImV4cCI6MjA5NzkwNTMwOX0.G69SkW-FpvP5RGsF6MhfXa3Jl-_OxHbfYURNo9Hqcvw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Configuration de la pagination et des filtres
let currentPage = 1;
let currentCategory = 'all';

// Mappage entre les slugs de boutons et les chaînes exactes attendues en BDD
const categoryMapping = {
  'travaux': 'Travaux',
  'conseil': 'Conseil municipal',
  'evenement': 'Événements',
  'culture': 'Culture',
  'prevention': 'Prévention',
  'bulletin': 'Bulletin'
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  loadFooter();
  setupFilters();
  fetchAndRender();
});

function loadFooter() {
  fetch('/components/footer.html')
    .then(r => r.text())
    .then(d => { document.getElementById('footer-placeholder').innerHTML = d; });
}

function setupFilters() {
  const filterBtns = document.querySelectorAll('#filters-container .actu-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentCategory = btn.dataset.cat;
      currentPage = 1; // On revient à la première page lors d'un changement de filtre
      fetchAndRender();
    });
  });
}

/**
 * UTILS - Raccroche les nouveaux éléments du DOM à l'IntersectionObserver global (.reveal)
 * ou à ScrollReveal, ou force la visibilité si aucun système n'est prêt.
 * @param {HTMLElement} parentContainer - Le conteneur parent contenant les nouveaux éléments .reveal
 */
function bindNewReveals(parentContainer) {
  if (window.revealObserver) {
    parentContainer.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el))
  } else if (window.ScrollReveal) {
    window.ScrollReveal().sync();
  } else {
    setTimeout(() => {
      if (window.revealObserver) {
        parentContainer.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el))
      } else if (window.ScrollReveal) {
        window.ScrollReveal().sync();
      } else {
        parentContainer.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
      }
    }, 100)
  }
}

async function fetchAndRender() {
  const gridContainer = document.getElementById('actu-grid');
  const uneContainer = document.getElementById('actu-une-container');
  
  // 1. Calcul précis des limites et offsets
  let limit = 12;
  let offset = 0;
  
  if (currentPage === 1) {
    limit = 10; // 1 à la une + 9 dans la grille
    offset = 0;
  } else {
    limit = 12; // Grille de 4 lignes sur 3 colonnes
    offset = 10 + (currentPage - 2) * 12;
  }

  // 2. Construction de la requête Supabase
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  if (currentCategory !== 'all') {
    query = query.eq('tag', categoryMapping[currentCategory]);
  }

  query = query.range(offset, offset + limit - 1);

  const { data: articles, count, error } = await query;

  if (error || !articles) {
    gridContainer.innerHTML = `<p style="color: var(--gris); grid-column: 1/-1; text-align: center;">Une erreur est survenue lors du chargement des actualités.</p>`;
    uneContainer.style.display = 'none';
    return;
  }

  // 3. Rendu de l'interface
  gridContainer.innerHTML = '';
  
  if (articles.length === 0) {
    uneContainer.style.display = 'none';
    gridContainer.innerHTML = `<p style="color: var(--gris); grid-column: 1/-1; text-align: center; padding: 2rem 0;">Aucun article ne correspond à cette catégorie.</p>`;
    renderPagination(0);
    return;
  }

  let articlesForGrid = [...articles];

  // Gestion spécifique de la Page 1 (Rendu de l'article à la Une)
  // Gestion spécifique de la Page 1 (Rendu de l'article à la Une)
  if (currentPage === 1) {
    const uneArticle = articles[0];
    articlesForGrid = articles.slice(1);

    // Correction du chemin vers /la-commune/actualites/article.html
    uneContainer.href = `/la-commune/actualites/article.html?id=${uneArticle.id}`;
    document.getElementById('actu-une-tag').textContent = uneArticle.tag;
    document.getElementById('actu-une-date').textContent = formatDate(uneArticle.created_at);
    document.getElementById('actu-une-title').textContent = uneArticle.titre;
    document.getElementById('actu-une-text').textContent = uneArticle.resume;
    
    const imgElement = document.getElementById('actu-une-img');
    
    if (uneArticle.image_url) {
      // S'il y a une image : on l'applique en fond et on nettoie l'intérieur (au cas où un placeholder s'y trouvait)
      imgElement.style.background = `url('${uneArticle.image_url}') center/cover`;
      imgElement.innerHTML = ''; 
    } else {
      // S'il n'y a PAS d'image : on retire le fond et on injecte le bloc placeholder adapté
      imgElement.style.background = ''; 
      imgElement.innerHTML = `
        <div class="actu-une-img-placeholder">
          <svg width="48" height="48" fill="none" stroke-width="1.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      `;
    }
    uneContainer.style.display = '';
  } else {
    uneContainer.style.display = 'none';
  }

  // Rendu de la grille d'articles résiduels
  articlesForGrid.forEach(item => {
    const card = document.createElement('a');
    // Correction du chemin vers /la-commune/actualites/article.html
    card.href = `/la-commune/actualites/article.html?id=${item.id}`;
    card.className = 'actu-card reveal';
    card.dataset.cat = Object.keys(categoryMapping).find(key => categoryMapping[key] === item.tag) || 'all';

    let imgBlock = '';
    if (item.image_url) {
      imgBlock = `<img src="${item.image_url}" alt="${item.titre}">`;
    } else {
      imgBlock = `
        <div class="actu-card-img-placeholder">
          <svg width="32" height="32" fill="none" stroke-width="1.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="actu-card-img">
        ${imgBlock}
      </div>
      <div class="actu-card-body">
        <div class="actu-card-meta">
          <span class="actu-tag">${item.tag}</span>
          <span class="actu-card-date">${formatDate(item.created_at)}</span>
        </div>
        <div class="actu-card-title">${item.titre}</div>
        <div class="actu-card-excerpt">${item.resume}</div>
      </div>
    `;
    gridContainer.appendChild(card);
  });

  renderPagination(count);
  
  // Correction de l'affichage via l'utilitaire reveal global
  bindNewReveals(gridContainer);
}

function renderPagination(totalCount) {
  const paginationContainer = document.getElementById('actu-pagination');
  paginationContainer.innerHTML = '';

  if (totalCount <= 10) return; // Pas besoin de pagination si tout tient sur la p.1

  const totalPages = 1 + Math.ceil((totalCount - 10) / 12);

  // Flèche Précédent (affichée uniquement si on n'est pas sur la page 1)
  if (currentPage > 1) {
    const prevBtn = document.createElement('a');
    prevBtn.href = '#';
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>`;
    
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage--;
      fetchAndRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    paginationContainer.appendChild(prevBtn);
  }

  // Boucle d'affichage des numéros de pages
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('a');
    btn.href = '#';
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      fetchAndRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    paginationContainer.appendChild(btn);
  }

  // Flèche Suivant (affichée uniquement si on n'est pas sur la dernière page)
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('a');
    nextBtn.href = '#';
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>`;
    
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage++;
      fetchAndRender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    paginationContainer.appendChild(nextBtn);
  }
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}