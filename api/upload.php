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

// ── Pas de fichier → retour null (champ optionnel) ────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
    echo json_encode(['path' => null]);
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
