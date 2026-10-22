<?php
/**
 * /api/admin-users.php
 * Remplace /api/admin-users.js (Vercel Serverless / @supabase/supabase-js)
 *
 * Appels Supabase via cURL (REST API) — aucune dépendance npm.
 *
 * Actions disponibles (POST JSON) :
 *   invite  → inviteUserByEmail + mise à jour du profil
 *   delete  → deleteUser
 *
 * Sécurité :
 *   - Vérification du token Bearer via GET /auth/v1/user
 *   - Vérification du rôle admin/super_admin dans la table profiles
 *   - Protection des comptes super_admin
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

// ── Helpers cURL → Supabase ───────────────────────────────────────────────────

/**
 * Effectue un appel HTTP vers l'API Supabase.
 * @param string $method  GET|POST|PATCH|DELETE
 * @param string $path    Chemin après SUPABASE_URL (ex: "/auth/v1/user")
 * @param array  $headers Headers supplémentaires
 * @param mixed  $payload Corps JSON (array) ou null
 * @return array ['status' => int, 'body' => mixed]
 */
function supabase_request(string $method, string $path, array $headers = [], mixed $payload = null): array
{
    $url = SUPABASE_URL . $path;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    $defaultHeaders = [
        'apikey: '       . SUPABASE_SERVICE_ROLE_KEY,
        'Authorization: Bearer ' . SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation',
    ];
    $allHeaders = array_merge($defaultHeaders, $headers);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $allHeaders);

    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    }

    $response   = curl_exec($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $httpStatus,
        'body'   => json_decode($response, true),
    ];
}

/**
 * Vérifie un token JWT utilisateur (non-service) via l'API Supabase.
 * Renvoie le tableau user ou null si invalide.
 */
function verify_user_token(string $token): ?array
{
    $ch = curl_init(SUPABASE_URL . '/auth/v1/user');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: '       . SUPABASE_SERVICE_ROLE_KEY,
        'Authorization: Bearer ' . $token,
    ]);

    $response   = curl_exec($ch);
    $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpStatus !== 200) return null;
    $data = json_decode($response, true);
    return (isset($data['id'])) ? $data : null;
}

// ── Lecture corps JSON ────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Corps JSON invalide ou manquant']);
    exit;
}

// ── Vérification du token Bearer ─────────────────────────────────────────────
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$authHeader && function_exists('apache_request_headers')) {
    $reqHeaders = apache_request_headers();
    $authHeader = $reqHeaders['Authorization'] ?? '';
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

$callerUser = verify_user_token($token);
if (!$callerUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Token invalide ou expiré.']);
    exit;
}

$callerId = $callerUser['id'];

// ── Vérification du rôle admin ────────────────────────────────────────────────
$profileRes = supabase_request(
    'GET',
    '/rest/v1/profiles?id=eq.' . urlencode($callerId) . '&select=role',
);

if ($profileRes['status'] !== 200 || empty($profileRes['body'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Profil introuvable.']);
    exit;
}

$callerRole = $profileRes['body'][0]['role'] ?? '';
if (!in_array($callerRole, ['admin', 'super_admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Accès refusé : rôle insuffisant.']);
    exit;
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
$action = $body['action'] ?? '';

// ════════════════════════════════════════════════════════════════
// ACTION : invite
// ════════════════════════════════════════════════════════════════
if ($action === 'invite') {
    $emailInvite = $body['email']  ?? '';
    $prenom      = $body['prenom'] ?? '';
    $nom         = $body['nom']    ?? '';
    $role        = $body['role']   ?? 'employee';

    if (!$emailInvite || !filter_var($emailInvite, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Adresse email invalide.']);
        exit;
    }

    // Seul un super_admin peut créer un autre super_admin
    if ($role === 'super_admin' && $callerRole !== 'super_admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Seul un super_admin peut créer un super_admin.']);
        exit;
    }

    $redirectTo = SITE_URL . '/admin/set-password.html';

    $inviteRes = supabase_request(
        'POST',
        '/auth/v1/admin/invite',
        [],
        [
            'email'       => $emailInvite,
            'redirect_to' => $redirectTo,
            'data'        => ['prenom' => $prenom, 'nom' => $nom],
        ]
    );

    if ($inviteRes['status'] !== 200) {
        $errMsg = $inviteRes['body']['msg'] ?? $inviteRes['body']['message'] ?? 'Erreur lors de l\'invitation.';
        $alreadyExists = str_contains(strtolower($errMsg), 'already registered')
                      || str_contains(strtolower($errMsg), 'already been registered');
        http_response_code(400);
        echo json_encode([
            'error' => $alreadyExists
                ? 'Cette adresse email est déjà utilisée.'
                : $errMsg,
        ]);
        exit;
    }

    $newUserId = $inviteRes['body']['id'] ?? null;

    // Mettre à jour le profil (rôle + prénom/nom si trigger l'a créé)
    if ($newUserId) {
        $profileUpdate = ['prenom' => $prenom, 'nom' => $nom];
        if ($role !== 'employee') {
            $profileUpdate['role'] = $role;
        }

        supabase_request(
            'PATCH',
            '/rest/v1/profiles?id=eq.' . urlencode($newUserId),
            [],
            $profileUpdate
        );
    }

    echo json_encode(['success' => true, 'userId' => $newUserId]);
    exit;
}

// ════════════════════════════════════════════════════════════════
// ACTION : delete
// ════════════════════════════════════════════════════════════════
if ($action === 'delete') {
    $userId = $body['userId'] ?? '';

    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID utilisateur manquant.']);
        exit;
    }

    // Empêcher l'auto-suppression
    if ($userId === $callerId) {
        http_response_code(400);
        echo json_encode(['error' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        exit;
    }

    // Vérifier que la cible n'est pas super_admin (sauf si l'appelant l'est aussi)
    $targetRes = supabase_request(
        'GET',
        '/rest/v1/profiles?id=eq.' . urlencode($userId) . '&select=role',
    );

    $targetRole = $targetRes['body'][0]['role'] ?? '';
    if ($targetRole === 'super_admin' && $callerRole !== 'super_admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Seul un super_admin peut supprimer un autre super_admin.']);
        exit;
    }

    // Supprimer l'utilisateur dans auth.users
    $deleteRes = supabase_request(
        'DELETE',
        '/auth/v1/admin/users/' . urlencode($userId),
    );

    if ($deleteRes['status'] !== 200 && $deleteRes['status'] !== 204) {
        $errMsg = $deleteRes['body']['msg'] ?? $deleteRes['body']['message'] ?? 'Erreur lors de la suppression.';
        http_response_code(400);
        echo json_encode(['error' => $errMsg]);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}

// Action inconnue
http_response_code(400);
echo json_encode(['error' => 'Action inconnue : "' . htmlspecialchars($action) . '"']);
