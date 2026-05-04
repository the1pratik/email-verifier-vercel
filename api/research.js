export default async function handler(req, res) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return res.status(500).json({ error: 'TAVILY_API_KEY not set' });

  const { email } = req.query;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'valid email required' });

  const [localRaw, domain] = email.toLowerCase().split('@');
  const name = localRaw
    .replace(/\d+/g, '')
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
  const company = domain.replace(/\.(com|net|org|io|co|ai|app|dev|me|in|uk).*$/, '');

  const query = `Who is ${name} from ${domain}? Background, role at ${company}, and what the company does.`;

  try {
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
      }),
    });
    const data = await r.json();
    return res.status(200).json({
      query,
      name,
      domain,
      summary: data.answer || '',
      sources: (data.results || []).slice(0, 5).map(x => ({
        title: x.title, url: x.url, snippet: x.content,
      })),
    });
  } catch (e) {
    return res.status(502).json({ error: String(e) });
  }
}
