<?php
/**
 * /api/upload.php
 * Upload de fichiers (PDF, images) vers /uploads/
 *
 * Accepte : POST multipart/form-data avec champ "file" (optionnel)
 * Retourne : { "path": "/uploads/nom_timestamp.ext" } ou { "path": null }
 *
 * Types acceptés : PDF, JPG/JPEG, PNG, WEBP
 * Nom final      : sanitized_nom_TIMESTAMP.ext  (ex: rapport_conseil_1716900000.pdf)
 *
 * Sécurité :
 *   - Vérification du MIME réel (finfo)
 *   - Nom de fichier assaini (alphanum + tirets/underscores)
 *   - Extension forcée depuis le MIME (pas depuis le nom client)
 *   - Exécution PHP désactivée dans /uploads/ via .htaccess
 */

require_once __DIR__ . '/config.php';

// ── CORS ─────────────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// ── Vérification du token Bearer ─────────────────────────────────────────────
// OVH/Apache mutualisé supprime le header Authorization avant de le passer à PHP.
// Le .htaccess le copie dans REDIRECT_HTTP_AUTHORIZATION via une RewriteRule.
// On teste les trois sources dans l'ordre de priorité.
$authHeader = $_SERVER['HTTP_AUTHORIZATION']
           ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
           ?? '';
if (!$authHeader && function_exists('apache_request_headers')) {
    $reqHeaders = apache_request_headers();
    $authHeader = $reqHeaders['Authorization'] ?? $reqHeaders['authorization'] ?? '';
}

$token = '';
if (str_starts_with($authHeader, 'Bearer ')) {
    $token = trim(substr($authHeader, 7));
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Non authentifié : token manquant.']);
    exit;
}

// Vérification légère du token via Supabase
$ch = curl_init(SUPABASE_URL . '/auth/v1/user');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apikey: '       . SUPABASE_SERVICE_ROLE_KEY,
    'Authorization: Bearer ' . $token,
]);
$userRes    = curl_exec($ch);
$userStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($userStatus !== 200) {
    http_response_code(401);
    echo json_encode(['error' => 'Token invalide ou expiré.']);
    exit;
}

// ── Droits : admin OU au moins une permission de gestion de contenu ───────────
$userId = (json_decode($userRes, true)['id'] ?? null);
if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'Token invalide ou expiré.']);
    exit;
}

$ch2 = curl_init(SUPABASE_URL . '/rest/v1/profiles?id=eq.' . urlencode($userId)
    . '&select=role,can_manage_publications,can_manage_mediatheque,can_manage_commune,can_manage_vie_pratique,can_manage_urbanisme,can_manage_sivu,can_manage_vie_locale,can_manage_decouvrir');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'apikey: '       . SUPABASE_SERVICE_ROLE_KEY,
    'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
]);
$profileRes = curl_exec($ch2);
curl_close($ch2);

$p = (json_decode($profileRes, true)[0] ?? []);
$isAdmin    = in_array($p['role'] ?? '', ['admin', 'super_admin'], true);
$hasAnyPerm = false;
foreach ($p as $k => $v) {
    if (str_starts_with($k, 'can_manage_') && $v === true) { $hasAnyPerm = true; break; }
}
if (!$isAdmin && !$hasAnyPerm) {
    http_response_code(403);
    echo json_encode(['error' => 'Accès refusé : aucune permission de gestion de contenu.']);
    exit;
}

// ── Pas de fichier → retour null (champ optionnel) ────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
    echo json_encode(['path' => null]);
    exit;
}

if ($_FILES['file']['error'] === UPLOAD_ERR_INI_SIZE || $_FILES['file']['error'] === UPLOAD_ERR_FORM_SIZE) {
    http_response_code(413);
    echo json_encode(['error' => 'Fichier trop volumineux (limite : 5 Mo pour une image, 10 Mo pour un PDF).']);
    exit;
}

if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Erreur lors du téléversement (code ' . $_FILES['file']['error'] . ')']);
    exit;
}

// ── Vérification MIME réel ────────────────────────────────────────────────────
$allowedMimes = [
    'application/pdf' => 'pdf',
    'image/jpeg'      => 'jpg',
    'image/png'       => 'png',
    'image/webp'      => 'webp',
];

$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($_FILES['file']['tmp_name']);

if (!array_key_exists($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Type de fichier non autorisé. Acceptés : PDF, JPG, PNG, WEBP.']);
    exit;
}

$ext = $allowedMimes[$mimeType];

// ── Limite de taille selon le type : 5 Mo (images) / 10 Mo (PDF) ──────────────
$maxBytes = ($mimeType === 'application/pdf') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
if ($_FILES['file']['size'] > $maxBytes) {
    http_response_code(413);
    echo json_encode(['error' => $mimeType === 'application/pdf'
        ? 'PDF trop volumineux (max 10 Mo).'
        : 'Image trop volumineuse (max 5 Mo).']);
    exit;
}

// ── Assainissement du nom ─────────────────────────────────────────────────────
$originalName = pathinfo($_FILES['file']['name'], PATHINFO_FILENAME);
// Translittération simple : enlever accents, garder alphanum + tirets + underscores
$safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName);
$safeName = preg_replace('/_+/', '_', $safeName); // Déduplication des underscores
$safeName = trim($safeName, '_');
if (!$safeName) $safeName = 'fichier';

// Nom final : nom_timestamp.ext
$filename = $safeName . '_' . time() . '.' . $ext;

// ── Chemin de destination ─────────────────────────────────────────────────────
$uploadsDir = __DIR__ . '/../uploads/';

if (!is_dir($uploadsDir)) {
    if (!mkdir($uploadsDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Impossible de créer le dossier uploads/']);
        exit;
    }
}

$destination = $uploadsDir . $filename;

// ── Déplacement du fichier ────────────────────────────────────────────────────
if (!move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'Échec du déplacement du fichier sur le serveur.']);
    exit;
}

// Retourner le chemin public
echo json_encode(['path' => '/uploads/' . $filename]);