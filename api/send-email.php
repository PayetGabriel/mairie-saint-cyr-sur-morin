<?php
/**
 * /api/send-email.php
 * Remplace /api/contact.js (Vercel/Nodemailer/Gmail)
 *
 * Dépendance : PHPMailer (composer require phpmailer/phpmailer)
 *   ou téléchargement manuel dans /vendor/phpmailer/
 *
 * Utilise : OVH SMTP ssl0.ovh.net:465 (SSL)
 *           contact@saint-cyr-sur-morin.fr comme expéditeur
 */

require_once __DIR__ . '/config.php';

// PHPMailer (via Composer ou inclusion manuelle)
require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

// PHPMailer namespaces
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ── CORS ─────────────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// ── Lecture du corps JSON ─────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Corps de la requête manquant ou JSON invalide']);
    exit;
}

$prenom    = $body['prenom']    ?? '';
$nom       = $body['nom']       ?? '';
$email     = $body['email']     ?? '';
$telephone = $body['telephone'] ?? '';
$sujet     = $body['sujet']     ?? '';
$message   = $body['message']   ?? '';
$website   = $body['website']   ?? ''; // Honeypot

// ── Anti-spam (Honeypot) ──────────────────────────────────────────────────────
if (trim($website) !== '') {
    // Robot détecté — on renvoie 200 sans traiter
    echo json_encode(['success' => true]);
    exit;
}

// ── Validation des champs obligatoires ───────────────────────────────────────
if (!$prenom || !$nom || !$email || !$sujet || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs obligatoires manquants']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Adresse email invalide']);
    exit;
}

// ── Échappement HTML ──────────────────────────────────────────────────────────
function esc(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
$safePrenom    = esc($prenom);
$safeNom       = esc($nom);
$safeEmail     = esc($email);
$safeTelephone = esc($telephone);
$safeMessage   = esc($message);

// ── Dictionnaire des sujets ───────────────────────────────────────────────────
$sujetsTraduits = [
    'etat-civil'       => 'État Civil (Actes, mariages, naissance, passeport)',
    'arretes'          => 'Arrêtés municipaux (Consultation, demande, information)',
    'elections'        => 'Élections & Recensement citoyen',
    'ccas-social'      => 'Action sociale & CCAS (Aides, logement)',
    'urbanisme'        => 'Urbanisme (PLU, permis de construire, déclaration)',
    'voirie-technique' => 'Voirie, Propreté & Services Techniques',
    'eau-dechets'      => 'Eau, Assainissement & Déchets (Syndicats)',
    'cantine'          => 'Cantine & Menus',
    'transports'       => 'Transports scolaires & Études',
    'inscriptions'     => 'Inscriptions scolaires / Périscolaire',
    'mediatheque'      => 'Médiathèque (Inscriptions, animations)',
    'associations'     => 'Associations (Subventions, vie associative)',
    'salle-polyvalente'=> 'Location de la Salle Polyvalente',
    'evenements'       => 'Événements, Festivités & Culture',
    'signalement'      => 'Signalement (Problème, incivilité, urgence)',
    'site'             => 'Site web',
    'autre'            => 'Autre demande / Monsieur le Maire',
];

$sujetPropre = $sujetsTraduits[$sujet] ?? $sujet;

// ── Routage & thème ───────────────────────────────────────────────────────────
// Mairie par défaut
$destinataires = ['contact@saint-cyr-sur-morin.fr'];

$theme = [
    'primary'    => '#3a5a40',
    'badgeBg'    => '#e8f0e9',
    'badgeText'  => '#2e4a34',
    'enteteText' => 'Mairie de Saint-Cyr-sur-Morin',
    'subText'    => 'Nouveau message du site internet',
];

// SIVU : cantine / inscriptions / transports
if (in_array($sujet, ['cantine', 'inscriptions', 'transports'])) {
    $destinataires = ['sivu.stcyrstouen@orange.fr'];
    $theme = [
        'primary'    => '#5a3a63',
        'badgeBg'    => '#f2eaf4',
        'badgeText'  => '#744a7a',
        'enteteText' => 'SIVU Scolaire & Enfance',
        'subText'    => 'Nouveau message — Services Péri/Scolaires',
    ];
}

// Site web : uniquement contact@saint-cyr-sur-morin.fr
if ($sujet === 'site') {
    $destinataires = ['contact@saint-cyr-sur-morin.fr', 'gabrielpayet@hotmail.com'];
}

// ── Template HTML email ───────────────────────────────────────────────────────
$telBlock = $safeTelephone
    ? '<p style="margin: 5px 0 0; color: #555555; font-size: 14px;"><span style="color: ' . $theme['primary'] . '; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 5px;">Tél. :</span> <a href="tel:' . $safeTelephone . '" style="color: #2a2520; text-decoration: none;">' . $safeTelephone . '</a></p>'
    : '';

$logoUrl = 'https://saint-cyr-sur-morin.fr/assets/img/logoSaintCyr_2020_web.png';

$htmlContent = '
<div style="font-family: \'Segoe UI\', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e0dbd5;">
    <div style="background: ' . $theme['primary'] . '; padding: 30px; text-align: center;">
        <img src="' . $logoUrl . '" style="height: 70px; object-fit: contain; margin-bottom: 10px;" alt="Saint-Cyr-sur-Morin">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">' . $theme['enteteText'] . '</h2>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 5px 0 0;">' . $theme['subText'] . '</p>
    </div>
    <div style="background: #ffffff; padding: 35px 30px;">
        <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0ece6;">
            <p style="margin: 0 0 5px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Expéditeur</p>
            <p style="margin: 0; color: #2a2520; font-size: 16px; font-weight: 500;">' . $safePrenom . ' ' . $safeNom . '</p>
            <p style="margin: 5px 0 0; color: ' . $theme['primary'] . '; font-size: 14px;"><a href="mailto:' . $safeEmail . '" style="color: ' . $theme['primary'] . '; text-decoration: none;">' . $safeEmail . '</a></p>
            ' . $telBlock . '
        </div>
        <div style="margin-bottom: 25px;">
            <p style="margin: 0 0 5px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Sujet de la demande</p>
            <div style="display: inline-block; background: ' . $theme['badgeBg'] . '; color: ' . $theme['badgeText'] . '; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                ' . esc($sujetPropre) . '
            </div>
        </div>
        <div style="margin-bottom: 35px;">
            <p style="margin: 0 0 10px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Message</p>
            <div style="background: #fcfbf9; border: 1px solid #f0ece6; border-radius: 8px; padding: 20px; color: #2a2520; font-size: 15px; line-height: 1.6;">
                ' . nl2br($safeMessage) . '
            </div>
        </div>
    </div>
    <div style="background: #f4f1ec; padding: 20px; text-align: center; border-top: 1px solid #e0dbd5;">
        <p style="margin: 0; font-size: 12px; color: #888078;">Ce message a été envoyé automatiquement depuis le formulaire de contact du site officiel.</p>
    </div>
</div>';

// ── Envoi via PHPMailer / OVH SMTP ────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = MAIL_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = MAIL_USER;
    $mail->Password   = MAIL_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL port 465
    $mail->Port       = MAIL_PORT;
    $mail->CharSet    = 'UTF-8';

    // Expéditeur
    $mail->setFrom(MAIL_FROM, 'Formulaire contact — Mairie Saint-Cyr-sur-Morin');

    // Destinataires
    foreach ($destinataires as $dest) {
        $mail->addAddress(trim($dest));
    }

    // Reply-To = l'adresse du visiteur
    $mail->addReplyTo($email, $safePrenom . ' ' . $safeNom);

    // Objet & corps
    $mail->isHTML(true);
    $mail->Subject = '[Contact Site] ' . $sujetPropre . ' - ' . $safePrenom . ' ' . $safeNom;
    $mail->Body    = $htmlContent;
    $mail->AltBody = strip_tags(str_replace('<br>', "\n", $htmlContent));

    $mail->send();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    error_log('PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['error' => 'Erreur interne lors de l\'envoi']);
}
