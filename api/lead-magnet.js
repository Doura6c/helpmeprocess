// Vercel Serverless Function — capture lead du livre blanc -> Brevo
// Reçoit { prenom, email, company } depuis le formulaire du site,
// ajoute / met à jour le contact dans la liste Brevo "Leads – Livre blanc 2026",
// ce qui déclenche l'automatisation (Email 1 + séquence de nurturing).
//
// Clés stockées dans les variables d'environnement Vercel (jamais dans le code) :
//   BREVO_API_KEY  -> la clé API Brevo
//   BREVO_LIST_ID  -> l'identifiant numérique de la liste

export default async function handler(req, res) {
  // On n'accepte que les envois de formulaire (POST)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Lecture du corps de la requête (Vercel le parse déjà si JSON)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const email = (body.email || '').trim();
  const prenom = (body.prenom || '').trim();
  const company = (body.company || '').trim();

  // Validation email minimale
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'Email invalide' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    console.error('Config manquante : BREVO_API_KEY ou BREVO_LIST_ID absent');
    return res.status(500).json({ ok: false, error: 'Configuration serveur manquante' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        attributes: {
          PRENOM: prenom,
          ENTREPRISE: company,
        },
        listIds: [Number(listId)],
        updateEnabled: true, // si le contact existe déjà, on le met à jour + on l'ajoute à la liste
      }),
    });

    // Brevo renvoie 201 (créé) ou 204 (mis à jour). 400 "Contact already exist"
    // peut arriver sans updateEnabled ; on le traite comme un succès doux.
    if (brevoRes.ok || brevoRes.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const data = await brevoRes.json().catch(() => ({}));
    if (data && (data.code === 'duplicate_parameter')) {
      // Contact déjà présent : ce n'est pas une erreur bloquante
      return res.status(200).json({ ok: true });
    }

    console.error('Erreur Brevo', brevoRes.status, data);
    return res.status(502).json({ ok: false, error: 'Erreur fournisseur email' });
  } catch (err) {
    console.error('Exception lead-magnet', err);
    return res.status(500).json({ ok: false, error: 'Erreur serveur' });
  }
}
