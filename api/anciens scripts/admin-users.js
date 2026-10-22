/**
 * /api/admin-users.js
 * Vercel Serverless Function
 *
 * Opérations nécessitant la service role key (clé secrète côté serveur) :
 *   - invite  : inviteUserByEmail
 *   - delete  : deleteUser
 *
 * Variables d'environnement Vercel à configurer :
 *   SUPABASE_URL              → https://eyjooultejiibshzvztm.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY → (clé service_role dans Supabase > Settings > API)
 *   SITE_URL                  → https://votre-domaine.vercel.app
 *   ALLOWED_ORIGIN            → https://votre-domaine.vercel.app
 */

import { createClient } from '@supabase/supabase-js'

/* Client admin (service role) — jamais exposé côté client */
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
    },
  }
)

export default async function handler(req, res) {
  /* ── CORS ── */
  const origin = process.env.ALLOWED_ORIGIN || '*'
  res.setHeader('Access-Control-Allow-Origin',  origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Méthode non autorisée' })

  /* ── Vérification du token Bearer ── */
  const authHeader = req.headers.authorization || ''
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié : token manquant.' })
  }

  /* Vérifier que le token est valide */
  const { data: { user }, error: tokenErr } = await supabaseAdmin.auth.getUser(token)

  if (tokenErr || !user) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' })
  }

  /* ── Vérification du rôle admin ── */
  const { data: callerProfile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr || !callerProfile) {
    return res.status(403).json({ error: 'Profil introuvable.' })
  }

  const callerRole = callerProfile.role
  if (!['admin', 'super_admin'].includes(callerRole)) {
    return res.status(403).json({ error: 'Accès refusé : rôle insuffisant.' })
  }

  /* ── Dispatcher les actions ── */
  const { action } = req.body || {}

  /* ════════════════════════════════════════
     ACTION : invite
  ════════════════════════════════════════ */
  if (action === 'invite') {
    const { email, prenom = '', nom = '', role = 'employee' } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Adresse email invalide.' })
    }

    /* Seul un super_admin peut créer un autre super_admin ou admin */
    if (role === 'super_admin' && callerRole !== 'super_admin') {
      return res.status(403).json({ error: 'Seul un super_admin peut créer un super_admin.' })
    }

    const siteUrl    = process.env.SITE_URL || 'https://votre-site.vercel.app'
    const redirectTo = `${siteUrl}/admin/set-password.html`

    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: { prenom, nom },
      }
    )

    if (inviteErr) {
      const alreadyExists = inviteErr.message.toLowerCase().includes('already registered')
        || inviteErr.message.toLowerCase().includes('already been registered')
      return res.status(400).json({
        error: alreadyExists
          ? 'Cette adresse email est déjà utilisée.'
          : inviteErr.message,
      })
    }

    const newUserId = inviteData.user?.id

    /* Mettre à jour le profil créé par le trigger :
     * - Corriger le rôle si différent de 'employee'
     * - Corriger nom/prenom (le trigger handle_new_user les insère depuis raw_user_meta_data)
     */
    if (newUserId) {
      const profileUpdate = { prenom, nom }
      if (role !== 'employee') profileUpdate.role = role

      await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', newUserId)
    }

    return res.status(200).json({ success: true, userId: newUserId })
  }

  /* ════════════════════════════════════════
     ACTION : delete
  ════════════════════════════════════════ */
  if (action === 'delete') {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'ID utilisateur manquant.' })
    }

    /* Empêcher l'auto-suppression */
    if (userId === user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' })
    }

    /* Vérifier que la cible n'est pas super_admin (sauf si l'appelant l'est aussi) */
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single()

    if (targetProfile?.role === 'super_admin' && callerRole !== 'super_admin') {
      return res.status(403).json({ error: 'Seul un super_admin peut supprimer un autre super_admin.' })
    }

    /* Supprimer l'utilisateur dans auth.users
     * (la suppression du profil est gérée par la cascade ou un trigger) */
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteErr) {
      return res.status(400).json({ error: deleteErr.message })
    }

    return res.status(200).json({ success: true })
  }

  /* Action inconnue */
  return res.status(400).json({ error: `Action inconnue : "${action}"` })
}
