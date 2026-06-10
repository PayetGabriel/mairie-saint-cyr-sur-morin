// Fichier : /api/contact.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // On n'accepte que les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Sécurité Vercel : s'assurer que le body est présent
    if (!req.body) {
        return res.status(400).json({ error: 'Corps de la requête manquant' });
    }

    // Récupération des champs exacts de ton HTML
    const { prenom, nom, email, telephone, sujet, message } = req.body;

    // Vérification des champs obligatoires
    if (!prenom || !nom || !email || !sujet || !message) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    // --- DICTIONNAIRE DE TRADUCTION DES SUJETS ---
    const sujetsTraduits = {
        'etat-civil': 'État Civil (Actes, mariages, naissance)',
        'urbanisme': 'Urbanisme (PLU, permis de construire)',
        'elections': 'Élections & Recensement',
        'cantine': 'Cantine & Menus',
        'inscriptions': 'Inscriptions scolaires / Périscolaire',
        'associations': 'Associations & Clubs',
        'evenements': 'Événements & Culture',
        'voirie': 'Voirie & Propreté',
        'autre': 'Autre demande / Monsieur le Maire'
    };

    // Récupération du label propre (si inconnu, on garde la valeur brute par sécurité)
    const sujetPropre = sujetsTraduits[sujet] || sujet;

    // --- CONFIGURATION DYNAMIQUE DU THÈME & ROUTAGE ---
    let destinataire = 'gabrielpayet@hotmail.com, mairie.stcyrsurmorin@orange.fr'; // Mairie par défaut
    
    // Définition des couleurs du thème Mairie (Par défaut)
    let theme = {
        primary: '#3a5a40',       // --vert
        badgeBg: '#e8f0e9',       // --vert-pale adapté email
        badgeText: '#2e4a34',     // --vert-clair assombri
        enteteText: 'Mairie de Saint-Cyr-sur-Morin',
        subText: 'Nouveau message du site internet'
    };

    // Si le sujet est lié au scolaire/enfance, on bascule sur le SIVU (Destinataire + Couleurs)
    if (['cantine', 'inscriptions'].includes(sujet)) {
        destinataire = 'gabrielpayet250509@gmail.com'; 
        
        // On écrase les variables avec la charte SIVU Violette
        theme = {
            primary: '#5a3a63',       // --violet
            badgeBg: '#f2eaf4',       // --violet-pale
            badgeText: '#744a7a',     // --violet-bois
            enteteText: 'SIVU Scolaire & Enfance',
            subText: 'Nouveau message — Services Péri/Scolaires'
        };
    }

    // Vérification des variables d'environnement avant configuration
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.error("Configuration manquante : MAIL_USER ou MAIL_PASS est undefined");
        return res.status(500).json({ error: 'Configuration serveur invalide' });
    }

    // Configuration explicite pour Gmail sur Vercel
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true pour le port 465 (SSL)
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    // --- DESIGN DE L'EMAIL DYNAMIQUE (Utilise l'objet theme) ---
    const htmlContent = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e0dbd5;">
        <div style="background: ${theme.primary}; padding: 30px; text-align: center;">
            <img src="https://mairie-saint-cyr-sur-morin.vercel.app/assets/img/logoSaintCyr_2020_web.png" style="height: 70px; object-fit: contain; margin-bottom: 10px;" alt="Saint-Cyr-sur-Morin">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">${theme.enteteText}</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 5px 0 0;">${theme.subText}</p>
        </div>
        <div style="background: #ffffff; padding: 35px 30px;">
            <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0ece6;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Expéditeur</p>
                <p style="margin: 0; color: #2a2520; font-size: 16px; font-weight: 500;">${prenom} ${nom}</p>
                <p style="margin: 5px 0 0; color: ${theme.primary}; font-size: 14px;"><a href="mailto:${email}" style="color: ${theme.primary}; text-decoration: none;">${email}</a></p>
                ${telephone ? `<p style="margin: 5px 0 0; color: #555555; font-size: 14px;"><span style="color: ${theme.primary}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-right: 5px;">Tél. :</span> <a href="tel:${telephone}" style="color: #2a2520; text-decoration: none;">${telephone}</a></p>` : ''}
            </div>
            <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Sujet de la demande</p>
                <div style="display: inline-block; background: ${theme.badgeBg}; color: ${theme.badgeText}; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                    ${sujetPropre}
                </div>
            </div>
            <div>
                <p style="margin: 0 0 10px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Message</p>
                <div style="background: #fcfbf9; border: 1px solid #f0ece6; border-radius: 8px; padding: 20px; color: #2a2520; font-size: 15px; line-height: 1.6;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>
        </div>
        <div style="background: #f4f1ec; padding: 20px; text-align: center; border-top: 1px solid #e0dbd5;">
            <p style="margin: 0; font-size: 12px; color: #888078;">Ce message a été envoyé automatiquement depuis le formulaire de contact du site officiel.</p>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: destinataire,
            replyTo: email,
            subject: `[Contact Site] ${sujetPropre} - ${prenom} ${nom}`,
            html: htmlContent

            // --- AJOUT DE DESTINATAIRES SUPPLÉMENTAIRES (Options) ---
            // Pour mettre plusieurs personnes en destinataire principal :
            // to: [destinataire, 'autre-adresse@mail.com'].join(', '),
            
            // Pour ajouter un ou plusieurs CC (visibles par tous) :
            // cc: 'adjoint.mairie@orange.fr',
            
            // Pour ajouter un ou plusieurs CCI (cachés / archive secrète) :
            // bcc: 'archive-site@saint-cyr-sur-morin.fr'
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Erreur Nodemailer détectée:", err);
        return res.status(500).json({ error: 'Erreur interne lors de l\'envoi' });
    }
};