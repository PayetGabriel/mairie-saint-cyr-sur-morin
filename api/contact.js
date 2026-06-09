const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { prenom, nom, email, telephone, sujet, message } = body;

    if (!prenom || !nom || !email || !sujet || !message) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    let destination = "gabrielpayet@hotmail.com";

    if (["cantine", "inscriptions"].includes(sujet)) {
      destination = "gabrielpayet250509@gmail.com";
    }

    await resend.emails.send({
      from: "Contact <onboarding@resend.dev>",
      to: destination,
      subject: `Contact mairie - ${sujet}`,
      html: `
        <p><b>${prenom} ${nom}</b></p>
        <p>${email}</p>
        <p>${telephone || ""}</p>
        <hr/>
        <p>${message}</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Erreur serveur",
      details: err.message
    });
  }
};