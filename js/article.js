import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://eyjooultejiibshzvztm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5am9vdWx0ZWppaWJzaHp2enRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjkzMDksImV4cCI6MjA5NzkwNTMwOX0.G69SkW-FpvP5RGsF6MhfXa3Jl-_OxHbfYURNo9Hqcvw'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

document.addEventListener('DOMContentLoaded', () => {
  loadFooter();
  initArticle();
});

function loadFooter() {
  fetch('/components/footer.html')
    .then(r => r.text())
    .then(d => { document.getElementById('footer-placeholder').innerHTML = d; });
}

async function initArticle() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');

  if (!articleId || articleId.trim() === '') {
    showNotFound();
    return;
  }

  // 1. Récupération de l'article ciblé
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_draft', false)
    .eq('id', articleId)
    .single();

  if (error || !article) {
    console.error("Erreur de récupération ou article introuvable :", error);
    showNotFound();
    return;
  }

  // 2. Rendu complet des informations
  renderArticle(article);
  
  // 3. Configuration du bouton de partage
  setupShareButton();

  // 4. Récupération intelligente et rendu des articles liés
  fetchAndRenderRelated(article);
}

function renderArticle(data) {
  document.getElementById('article-loading').style.display = 'none';
  document.getElementById('article-content').style.display = 'block';

  document.title = data.titre + ' — Saint-Cyr-sur-Morin';
  const metaDesc = document.getElementById('page-description');
  if (metaDesc) {
    metaDesc.content = data.resume || data.titre;
  }

  document.getElementById('art-tag').textContent = data.tag || 'Actualité';
  document.getElementById('art-date').textContent = formatDate(data.created_at);
  document.getElementById('art-title').textContent = data.titre;
  document.getElementById('art-body').innerHTML = data.contenu;
  document.getElementById('art-auteur').textContent = data.auteur || 'La Mairie';

  const heroWrap = document.getElementById('art-hero-wrap');
  const heroImg = document.getElementById('art-hero');
  if (data.image_url) {
    heroImg.src = data.image_url;
    heroImg.alt = data.titre;
    heroWrap.style.display = 'block';
  } else {
    heroWrap.style.display = 'none';
  }
}

function setupShareButton() {
  const shareBtn = document.getElementById('share-link-btn');
  if (!shareBtn) return;

  // Ajuste l'infobulle native selon la compatibilité
  shareBtn.setAttribute('title', navigator.share ? 'Partager cet article' : 'Copier le lien');

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);

      const oldTitle = shareBtn.getAttribute('title') || 'Partager';
      shareBtn.setAttribute('title', 'Lien copié !');

      const spanText = shareBtn.parentElement.querySelector('span');
      if (spanText) {
        const originalText = spanText.textContent;
        spanText.textContent = 'Copié !';
        spanText.style.color = 'var(--vert)';
        setTimeout(() => {
          spanText.textContent = originalText;
          spanText.style.color = '';
          shareBtn.setAttribute('title', oldTitle);
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur lors de la copie du lien : ', err);
    }
  });
}

async function fetchAndRenderRelated(currentArticle) {
  const grid = document.getElementById('related-grid');
  const section = document.getElementById('related-section');
  
  // Étape A : On cherche jusqu'à 3 articles récents de la même catégorie (tag), hors article actuel
  let { data: related, error: err1 } = await supabase
    .from('articles')
    .select('id, titre, tag, created_at')
    .eq('is_draft', false)
    .eq('tag', currentArticle.tag)
    .neq('id', currentArticle.id)
    .order('created_at', { ascending: false })
    .limit(3);

  if (err1 || !related) related = [];

  // Étape B : Si on en a moins de 3, on complète avec les derniers articles généraux (hors doublons)
  if (related.length < 3) {
    const excludedIds = [currentArticle.id, ...related.map(r => r.id)];
    
    let query = supabase
      .from('articles')
      .select('id, titre, tag, created_at')
      .eq('is_draft', false);
      
    // Évite les erreurs de syntaxe SQL si le tableau d'exclusion ne contient qu'un ID numérique ou UUID
    if (excludedIds.length > 0) {
      query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data: backfill, error: err2 } = await query
      .order('created_at', { ascending: false })
      .limit(3 - related.length);

    if (!err2 && backfill) {
      related = [...related, ...backfill];
    }
  }

  // Étape C : Rendu HTML si des suggestions existent
  if (related.length > 0) {
    grid.innerHTML = '';
    related.forEach(a => {
      grid.innerHTML += `
        <a href="/la-commune/actualites/article.html?id=${a.id}" class="related-card">
          <div class="related-card-tag">${a.tag || 'Actualité'}</div>
          <div class="related-card-title">${a.titre}</div>
          <div class="related-card-date">${formatDate(a.created_at)}</div>
        </a>
      `;
    });
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
}

function showNotFound() {
  document.getElementById('article-loading').style.display = 'none';
  document.getElementById('article-content').style.display = 'none';
  document.getElementById('article-not-found').style.display = 'block';
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}