/**
 * auth-guard.js
 * - requireAuth()    : vérifie la session, redirige si non connecté
 * - buildSidebar()   : construit le sidebar avec le bon état actif
 * - showToast()      : notifications légères
 * - Helpers divers   : initiales, label de rôle, etc.
 */

import { supabase } from './supabase-config.js'

/* ── Mapping permissions ─────────────────────────────────── */
export const PERMISSIONS = {
  can_manage_commune:       'La Commune',
  can_manage_vie_pratique:  'Vie Pratique',
  can_manage_urbanisme:     'Urbanisme',
  can_manage_sivu:          'SIVU',
  can_manage_vie_locale:    'Vie Locale',
  can_manage_decouvrir:     'Découvrir',
  can_manage_publications:  'Publications',
  can_manage_mediatheque:   'Médiathèque',
}

export const PERM_KEYS = Object.keys(PERMISSIONS)

/* ── requireAuth ──────────────────────────────────────────
 * Vérifie la session Supabase et charge le profil.
 * Redirige vers login.html si non authentifié.
 * @param {object} opts
 * @param {boolean} opts.requireAdmin  — redirige vers dashboard si pas admin
 * @returns {Promise<{session, profile}|null>}
 */
export async function requireAuth({ requireAdmin = false } = {}) {
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

  if (sessionErr || !session) {
    window.location.replace('/admin/login.html')
    return null
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileErr || !profile) {
    await supabase.auth.signOut()
    window.location.replace('/admin/login.html')
    return null
  }

  if (requireAdmin && !isAdmin(profile)) {
    window.location.replace('/admin/dashboard.html')
    return null
  }

  return { session, profile }
}

/* ── logout ───────────────────────────────────────────────── */
export async function logout() {
  /* Enregistrer la déconnexion avant de fermer la session.
     Le try/catch garantit que l'échec du log ne bloque jamais la déconnexion. */
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: prof } = await supabase
        .from('profiles').select('prenom,nom,email').eq('id', user.id).single()
      const name = prof
        ? ([prof.prenom, prof.nom].filter(Boolean).join(' ') || prof.email)
        : user.email
      await supabase.from('activity_logs').insert({
        user_id:    user.id,
        user_email: prof?.email || user.email,
        user_name:  name,
        action:     'SIGNOUT',
      })
    }
  } catch {}
  await supabase.auth.signOut()
  window.location.replace('/admin/login.html')
}

/* ── isAdmin ─────────────────────────────────────────────── */
export function isAdmin(profile) {
  return ['admin', 'super_admin'].includes(profile.role)
}

/* ── buildSidebar ─────────────────────────────────────────
 * Injecte le sidebar complet dans #sidebar.
 * @param {object} profile    — profil Supabase de l'utilisateur connecté
 * @param {string} activePage — identifiant de la page active
 */
export function buildSidebar(profile, activePage) {
  const admin = isAdmin(profile)
  const hasPublications = admin || profile.can_manage_publications || profile.can_manage_mediatheque
  /* can_manage_publications et can_manage_mediatheque → onglet Publications uniquement,
     pas l'éditeur no-code. On les exclut du calcul hasAnyEdit. */
  const hasAnyEdit = admin || PERM_KEYS
    .filter(k => k !== 'can_manage_publications' && k !== 'can_manage_mediatheque')
    .some(k => profile[k])

  const initials = getInitials(profile)
  const roleLabel = getRoleLabel(profile.role)
  const displayName = [profile.prenom, profile.nom].filter(Boolean).join(' ') || profile.email

  /* ── Définition des items de navigation ── */
  const navItems = [
    {
      id: 'dashboard',
      href: '/admin/dashboard.html',
      label: 'Tableau de bord',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>`,
      visible: true,
      soon: false,
    },
    {
      id: 'publications',
      href: '/admin/publications.html',
      label: 'Publications',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"/></svg>`,
      visible: hasPublications,
      soon: false,
    },
    {
      id: 'editor',
      href: '/admin/editor.html',
      label: 'Éditeur No-Code',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>`,
      visible: hasAnyEdit,
      soon: false,
    },
    {
      id: 'journal',
      href: '/admin/journal.html',
      label: "Journal d'activité",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.25 12h5M7.25 15h5M7.25 18h3.25M15.75 18.75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>`,
      visible: admin,
      soon: false,
      external: false,
    },
    {
      id: 'users',
      href: '/admin/users.html',
      label: 'Utilisateurs',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>`,
      visible: admin,
      soon: false,
    },
    {
      id: 'settings',
      href: '/admin/settings.html',
      label: 'Paramètres',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      visible: true,
      soon: false,
    },
  ]

  const navHTML = navItems
    .filter(i => i.visible)
    .map(i => {
      const isActive = i.id === activePage
      const classes = ['nav-item', isActive ? 'active' : '', i.soon ? 'nav-disabled' : ''].filter(Boolean).join(' ')
      return `
        <a class="${classes}"
           href="${i.soon ? '#' : i.href}"
           ${i.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
           aria-label="${i.label}${i.soon ? ' (bientôt disponible)' : ''}">
          ${i.icon}
          <span>${i.label}</span>
          ${i.soon ? '<span class="nav-soon">bientôt</span>' : ''}
        </a>`
    }).join('')

  const sidebarEl = document.getElementById('sidebar')
  if (!sidebarEl) return

  sidebarEl.innerHTML = `
    <!-- On laisse le header brut pour que son border-bottom et son padding CSS s'appliquent parfaitement -->
    <div class="sidebar-header">
      <img class="sidebar-logo" src="/assets/img/logoSaintCyr_2020.svg" alt="Blason Saint-Cyr-sur-Morin">
      <div class="sidebar-header-text">
        <strong>Saint-Cyr-sur-Morin</strong>
        <span>Espace Administration</span>
      </div>
    </div>

    <!-- Conteneur avec du recul (12px) pour détacher le bouton du séparateur du header -->
    <div style="padding: 12px 16px 4px 16px;">
      <a href="/" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 6px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.8rem; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'; this.style.borderColor='rgba(255,255,255,0.25)'; this.style.color='#ffffff'" onmouseout="this.style.background='rgba(255,255,255,0.06)'; this.style.borderColor='rgba(255,255,255,0.12)'; this.style.color='rgba(255,255,255,0.8)'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 12px; height: 12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
        <span>Voir le site public</span>
      </a>
    </div>

    <nav class="sidebar-nav" role="navigation" aria-label="Menu principal">
      ${navHTML}
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar avatar-${profile.role}">${initials}</div>
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${displayName}</span>
          <span class="sidebar-user-role role-${profile.role}">${roleLabel}</span>
        </div>
      </div>
      <button class="btn-logout" id="btn-logout" aria-label="Se déconnecter">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>
        Déconnexion
      </button>
    </div>
  `

  /* Logout */
  document.getElementById('btn-logout').addEventListener('click', logout)

  /* Mobile toggle */
  const toggle = document.getElementById('btn-hamburger')
  const overlay = document.getElementById('sidebar-overlay')
  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      sidebarEl.classList.toggle('open')
      overlay.classList.toggle('open')
    })
    overlay.addEventListener('click', () => {
      sidebarEl.classList.remove('open')
      overlay.classList.remove('open')
    })
  }

  /* Vérifier la connexion Supabase */
  checkSupabaseStatus()
}

async function checkSupabaseStatus() {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    const el = document.getElementById('sidebar-status')
    if (!el) return
    if (error) {
      el.textContent = 'Supabase déconnecté'
      el.classList.add('offline')
    }
  } catch {
    const el = document.getElementById('sidebar-status')
    if (el) { el.textContent = 'Supabase déconnecté'; el.classList.add('offline') }
  }
}

/* ── Helpers ──────────────────────────────────────────────── */

export function getInitials(profile) {
  const p = (profile.prenom || '').trim()[0] || ''
  const n = (profile.nom || '').trim()[0] || ''
  const result = (p + n).toUpperCase()
  return result || (profile.email || '?')[0].toUpperCase()
}

export function getRoleLabel(role) {
  return { super_admin: 'Super Admin', admin: 'Admin', employee: 'Employé' }[role] || role
}

export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.transition = '0.28s ease'
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(110%)'
    setTimeout(() => toast.remove(), 300)
  }, 3500)
}

/* Ouvrir / fermer une modal */
export function openModal(id) {
  const el = document.getElementById(id)
  if (el) el.classList.add('open')
}

export function closeModal(id) {
  const el = document.getElementById(id)
  if (el) el.classList.remove('open')
}

/* Initialiser les fermetures de modals (data-close + backdrop + Escape) */
export function initModals() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close))
  })

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal(backdrop.id)
    })
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id))
    }
  })
}