// Fichier : /api/contact.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // On n'accepte que les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Récupération des champs exacts de ton HTML
    const { prenom, nom, email, telephone, sujet, message } = req.body;

    // Vérification des champs obligatoires (le téléphone est optionnel)
    if (!prenom || !nom || !email || !sujet || !message) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    // --- ROUTAGE SIVU vs MAIRIE ---
    let destinataire = 'gabrielpayet@hotmail.com'; // Mairie par défaut
    
    // Si le sujet est lié au scolaire/enfance, on envoie au SIVU
    if (['cantine', 'inscriptions'].includes(sujet)) {
        destinataire = 'gabrielpayet250509@gmail.com'; 
    }

    // Configuration de nodemailer avec ton Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    // --- DESIGN DE L'EMAIL (Thème Saint-Cyr-sur-Morin) ---
    const html = `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e0dbd5;">
        
        <div style="background: #3a5a40; padding: 30px; text-align: center;">
            <img src="https://mairie-saint-cyr-sur-morin.vercel.app/assets/img/logoSaintCyr_2020_web.png" style="height: 70px; object-fit: contain; margin-bottom: 10px;" alt="Saint-Cyr-sur-Morin">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">Mairie de Saint-Cyr-sur-Morin</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 5px 0 0;">Nouveau message du site internet</p>
        </div>

        <div style="background: #ffffff; padding: 35px 30px;">
            
            <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0ece6;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Expéditeur</p>
                <p style="margin: 0; color: #2a2520; font-size: 16px; font-weight: 500;">${prenom} ${nom}</p>
                <p style="margin: 5px 0 0; color: #3a5a40; font-size: 14px;"><a href="mailto:${email}" style="color: #3a5a40; text-decoration: none;">${email}</a></p>
                ${telephone ? `<p style="margin: 5px 0 0; color: #555; font-size: 14px;">📞 ${telephone}</p>` : ''}
            </div>

            <div style="margin-bottom: 25px;">
                <p style="margin: 0 0 5px; font-size: 12px; color: #888078; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Sujet de la demande</p>
                <div style="display: inline-block; background: #e8f0e9; color: #2e4a34; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                    ${sujet}
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
            from: `"Site Saint-Cyr" <${process.env.MAIL_USER}>`,
            to: destinataire, // La variable calculée plus haut
            replyTo: email, // Permet de faire "Répondre" directement à l'habitant
            subject: `[Contact Site] ${sujet} - ${prenom} ${nom}`,
            html: html
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("Erreur d'envoi:", err);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
    }
}