<?php
/**
 * /api/config.php
 * Fichier centralisé des secrets — OVH Apache/PHP
 *
 * ⚠ Ce fichier est protégé contre l'accès direct par .htaccess.
 *    Ne jamais exposer ce fichier côté client.
 *
 * Inclus avec require_once __DIR__ . '/config.php' dans chaque script /api/*.php
 */

// ── Supabase ────────────────────────────────────────────────────────────────
define('SUPABASE_URL',              'https://eyjooultejiibshzvztm.supabase.co');
define('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5am9vdWx0ZWppaWJzaHp2enRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMyOTMwOSwiZXhwIjoyMDk3OTA1MzA5fQ.g2QzPDjcHXzHNaVnCyrrldk0S65U9Qs5rdaBVHxtOhM'); // ← Coller ici la service_role key (Supabase > Settings > API)

// ── Email (OVH SMTP) ─────────────────────────────────────────────────────────
define('MAIL_FROM',   'contact@saint-cyr-sur-morin.fr'); // Expéditeur OVH (FROM)
define('MAIL_USER',   'contact@saint-cyr-sur-morin.fr'); // Identifiant SMTP OVH
define('MAIL_PASS',   'mairie5Ruedesmontgou!');                               // ← Mot de passe OVH
define('MAIL_HOST',   'ssl0.ovh.net');
define('MAIL_PORT',   465);

// ── Site ─────────────────────────────────────────────────────────────────────
define('SITE_URL',        'https://saint-cyr-sur-morin.fr');
define('ALLOWED_ORIGIN',  'https://saint-cyr-sur-morin.fr');
