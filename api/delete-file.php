<?php
/**
 * /api/delete-file.php
 * Suppression physique d'un fichier dans /uploads/
 *
 * Accepte : POST JSON { "path": "/uploads/mon-fichier.pdf" }
 * Retourne : { "success": true } ou { "error": "..." }
 *
 * Sécurité :
 *   - Vérification du token Bearer (utilisateur authentifié)
 *   - Le chemin doit obligatoirement être dans /uploads/
 *     (protection contre les directory traversal)
 *   - Vérification que le fichier est bien sous DOCUMENT_ROOT/uploads/
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

// Vérification du token via Supabase
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

// ── Lecture du chemin à supprimer ─────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

$filePath = $body['path'] ?? '';

if (!$filePath) {
    http_response_code(400);
    echo json_encode(['error' => 'Chemin du fichier manquant.']);
    exit;
}

// ── Validation : le chemin doit commencer par /uploads/ ───────────────────────
// Normalisation : on s'assure qu'il n'y a pas de séquences ../ ou équivalent
$realUploadDir = realpath(__DIR__ . '/../uploads');
if ($realUploadDir === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Dossier uploads introuvable sur le serveur.']);
    exit;
}

// Reconstruction du chemin absolu à partir de la racine du site
$docRoot      = rtrim($_SERVER['DOCUMENT_ROOT'], '/');
$absolutePath = realpath($docRoot . '/' . ltrim($filePath, '/'));

// Sécurité : le fichier résolu doit bien être sous le dossier uploads
if ($absolutePath === false || !str_starts_with($absolutePath, $realUploadDir . DIRECTORY_SEPARATOR)) {
    http_response_code(400);
    echo json_encode(['error' => 'Chemin non autorisé. Seuls les fichiers dans /uploads/ peuvent être supprimés.']);
    exit;
}

// ── Suppression physique ──────────────────────────────────────────────────────
if (!file_exists($absolutePath)) {
    // Fichier déjà absent → succès silencieux (idempotent)
    echo json_encode(['success' => true, 'note' => 'Fichier déjà absent.']);
    exit;
}

if (!unlink($absolutePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible de supprimer le fichier (permissions serveur ?).']);
    exit;
}

echo json_encode(['success' => true]);