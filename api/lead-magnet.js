// Vercel Serverless Function — capture de leads -> Brevo (multi-segments)
//
// Reçoit { prenom, email, company, telephone, segment } depuis un formulaire
// du site, ajoute / met à jour le contact dans la bonne liste Brevo, ce qui
// déclenche l'automatisation correspondante (séquence de nurturing).
//
// Segments :
//   (défaut)  -> livre blanc  -> liste BREVO_LIST_ID
//   "local"   -> entreprises locales (vidéo) -> liste BREVO_LIST_ID_LOCAL
//
// Variables d'environnement Vercel (jamais dans le code) :
//   BREVO_API_KEY        -> la clé API Brevo
//   BREVO_LIST_ID        -> liste « Leads – Livre blanc 2026 »
//   BREVO_LIST_ID_LOCAL  -> liste « Leads – Entreprises locales »

// Normalise un numéro guinéen vers le format international +224XXXXXXXXX
function normalizePhone(raw) {
  if (!raw) return '';
  let p = String(raw).replace(/[\s().-]/g, '');
  if (p.startsWith('+')) return p;
  if (p.startsWith('00')) return '+' + p.slice(2);
  if (p.startsWith('224')) return '+' + p;
  // numéro local guinéen (souvent 9 chiffres, commence par 6)
  if (/^\d{8,9}$/.test(p)) return '+224' + p;
  return p;
}

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
  const phone = normalizePhone(body.telephone || body.phone || '');
  const segment = (body.segment || '').trim().toLowerCase();

  // Validation email minimale
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'Email invalide' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  // Choix de la liste selon le segment
  const listId = segment === 'local'
    ? process.env.BREVO_LIST_ID_LOCAL
    : process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('Config manquante : BREVO_API_KEY ou liste absente (segment=' + segment + ')');
    return res.status(500).json({ ok: false, error: 'Configuration serveur manquante' });
  }

  // Attributs du contact
  const attributes = { PRENOM: prenom, ENTREPRISE: company };
  if (phone) attributes.SMS = phone; // champ SMS/WhatsApp Brevo

  async function createContact(withPhone) {
    const attrs = Object.assign({}, attributes);
    if (!withPhone) delete attrs.SMS;
    return fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        attributes: attrs,
        listIds: [Number(listId)],
        updateEnabled: true, // met à jour si le contact existe déjà
      }),
    });
  }

  try {
    let brevoRes = await createContact(true);

    // Brevo : 201 (créé) ou 204 (mis à jour) = succès
    if (brevoRes.ok || brevoRes.status === 204) {
      return res.status(200).json({ ok: true });
    }

    let data = await brevoRes.json().catch(() => ({}));

    // Contact déjà présent : pas bloquant
    if (data && data.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true });
    }

    // Numéro invalide refusé par Brevo : on réessaie sans le téléphone
    // pour ne jamais perdre le lead (il est quand même ajouté à la liste).
    if (phone && brevoRes.status === 400) {
      brevoRes = await createContact(false);
      if (brevoRes.ok || brevoRes.status === 204) {
        return res.status(200).json({ ok: true, note: 'phone_skipped' });
      }
      data = await brevoRes.json().catch(() => ({}));
      if (data && data.code === 'duplicate_parameter') {
        return res.status(200).json({ ok: true, note: 'phone_skipped' });
      }
    }

    console.error('Erreur Brevo', brevoRes.status, data);
    return res.status(502).json({ ok: false, error: 'Erreur fournisseur email' });
  } catch (err) {
    console.error('Exception lead-magnet', err);
    return res.status(500).json({ ok: false, error: 'Erreur serveur' });
  }
}
