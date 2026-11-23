// Fonction Vercel : email de candidature de franchise BANGER via Resend.
// Définir RESEND_API_KEY, BANGER_CONTACT_EMAIL et BANGER_FROM_EMAIL dans Vercel.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée.' });
  }
  const { RESEND_API_KEY, BANGER_CONTACT_EMAIL, BANGER_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !BANGER_CONTACT_EMAIL || !BANGER_FROM_EMAIL) {
    console.error('BANGER candidature: variables d’environnement manquantes.');
    return res.status(503).json({ ok: false, error: 'Le formulaire est temporairement indisponible. Réessayez plus tard.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const fields = ['last_name', 'first_name', 'phone', 'email', 'city', 'budget', 'message'];
  const values = Object.fromEntries(fields.map(field => [field, typeof body[field] === 'string' ? body[field].trim() : '']));
  if (fields.some(field => !values[field]) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
      !/^[+()0-9.\s-]{6,30}$/.test(values.phone) ||
      fields.some(field => values[field].length > (field === 'message' ? 5000 : 300))) {
    return res.status(400).json({ ok: false, error: 'Veuillez vérifier les champs du formulaire.' });
  }
  // Les champs sont envoyés uniquement en texte brut, aucun HTML utilisateur n’est interprété.
  const text = [
    'Nouvelle candidature franchise BANGER', '',
    `Nom : ${values.last_name}`,
    `Prénom : ${values.first_name}`,
    `Téléphone : ${values.phone}`,
    `E-mail : ${values.email}`,
    `Ville souhaitée : ${values.city}`,
    `Apport personnel : ${values.budget}`,
    '', 'Projet :', values.message
  ].join('\n');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: BANGER_FROM_EMAIL,
        to: [BANGER_CONTACT_EMAIL],
        reply_to: values.email,
        subject: `Candidature franchise BANGER — ${values.city}`,
        text
      })
    });
    if (!response.ok) {
      console.error('Resend candidature failed:', response.status, (await response.text()).slice(0, 500));
      return res.status(502).json({ ok: false, error: 'L’envoi a échoué. Veuillez réessayer plus tard.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erreur réseau Resend:', error);
    return res.status(502).json({ ok: false, error: 'L’envoi a échoué. Veuillez réessayer plus tard.' });
  }
}
