// Vercel Serverless Function — capture de leads -> Brevo (multi-segments)
//
// Reçoit { prenom, nom, email, company, telephone, segment,
//          secteur, pays, besoin, volume, message } depuis le
// formulaire unique du site, ajoute / met à jour le contact dans la
// bonne liste Brevo, ce qui déclenche l'automatisation correspondante
// (séquence de nurturing) + le téléchargement du livre blanc côté front.
//
// Segments :
//   "local"          -> entreprises Guinée/Afrique -> BREVO_LIST_ID_LOCAL
//   "international"   -> entreprises Europe/intl    -> BREVO_LIST_ID_INTL
//   (défaut / autre)  -> livre blanc                -> BREVO_LIST_ID
//
// Variables d'environnement Vercel (jamais dans le code) :
//   BREVO_API_KEY        -> la clé API Brevo
//   BREVO_LIST_ID        -> liste « Leads – Livre blanc 2026 » (défaut)
//   BREVO_LIST_ID_LOCAL  -> liste « Leads – Entreprises locales »
//   BREVO_LIST_ID_INTL   -> liste « Leads – International » (sinon retombe sur BREVO_LIST_ID)
//
// Attributs Brevo utilisés : PRENOM, ENTREPRISE, SMS (existants) +
//   NOM, SECTEUR, PAYS, BESOIN, VOLUME, MESSAGE (à créer dans Brevo).
// Si un attribut ou une liste n'existe pas encore, on dégrade
// gracieusement : le lead est TOUJOURS enregistré (jamais perdu).

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
  const nom = (body.nom || '').trim();
  const company = (body.company || '').trim();
  const phone = normalizePhone(body.telephone || body.phone || '');
  const segment = (body.segment || '').trim().toLowerCase();
  const secteur = (body.secteur || '').trim();
  const pays = (body.pays || '').trim();
  const besoin = (body.besoin || '').trim();
  const volume = (body.volume || '').trim();
  const message = (body.message || '').trim();

  // Validation email minimale
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'Email invalide' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  // Choix de la liste selon le segment
  let listId;
  if (segment === 'local') listId = process.env.BREVO_LIST_ID_LOCAL;
  else if (segment === 'international') listId = process.env.BREVO_LIST_ID_INTL || process.env.BREVO_LIST_ID;
  else listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('Config manquante : BREVO_API_KEY ou liste absente (segment=' + segment + ')');
    return res.status(500).json({ ok: false, error: 'Configuration serveur manquante' });
  }

  // Jeu d'attributs complet (nécessite que les attributs existent dans Brevo)
  const fullAttributes = { PRENOM: prenom, NOM: nom, ENTREPRISE: company };
  if (secteur) fullAttributes.SECTEUR = secteur;
  if (pays) fullAttributes.PAYS = pays;
  if (besoin) fullAttributes.BESOIN = besoin;
  if (volume) fullAttributes.VOLUME = volume;
  if (message) fullAttributes.MESSAGE = message;
  if (phone) fullAttributes.SMS = phone; // champ SMS/WhatsApp Brevo

  // Jeu d'attributs minimal et sûr (uniquement des attributs Brevo standards)
  const safeAttributes = { PRENOM: prenom, ENTREPRISE: company };

  function createContact(attrs) {
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

  function isSuccess(r) { return r.ok || r.status === 204; }

  try {
    // Tentative 1 — attributs complets (secteur, pays, besoin, etc.)
    let brevoRes = await createContact(fullAttributes);
    if (isSuccess(brevoRes)) {
      return res.status(200).json({ ok: true });
    }

    let data = await brevoRes.json().catch(() => ({}));
    if (data && data.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true });
    }

    // Tentative 2 — un attribut/liste a été refusé (souvent : attribut Brevo
    // pas encore créé, ou numéro invalide). On rejoue avec le jeu minimal
    // pour ne JAMAIS perdre le lead (il est quand même ajouté à la liste).
    if (brevoRes.status === 400) {
      brevoRes = await createContact(safeAttributes);
      if (isSuccess(brevoRes)) {
        return res.status(200).json({ ok: true, note: 'attributes_reduced' });
      }
      data = await brevoRes.json().catch(() => ({}));
      if (data && data.code === 'duplicate_parameter') {
        return res.status(200).json({ ok: true, note: 'attributes_reduced' });
      }
    }

    console.error('Erreur Brevo', brevoRes.status, data);
    return res.status(502).json({ ok: false, error: 'Erreur fournisseur email' });
  } catch (err) {
    console.error('Exception lead-magnet', err);
    return res.status(500).json({ ok: false, error: 'Erreur serveur' });
  }
}
