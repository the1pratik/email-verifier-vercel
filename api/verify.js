const BASE = 'https://client.myemailverifier.com/verifier';

export default async function handler(req, res) {
  const key = process.env.MEV_API_KEY;
  if (!key) return res.status(500).json({ error: 'MEV_API_KEY not set' });

  const { email, type = 'single' } = req.query;

  try {
    if (type === 'credits') {
      const r = await fetch(`${BASE}/getcredits/${key}`);
      const j = await r.json();
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(String(j.credits ?? ''));
    }

    if (!email) return res.status(400).json({ error: 'email required' });

    const r = await fetch(`${BASE}/validate_single/${encodeURIComponent(email)}/${key}`);
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
