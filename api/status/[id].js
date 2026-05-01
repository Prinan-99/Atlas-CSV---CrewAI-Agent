export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ detail: 'Method not allowed' });
    return;
  }

  const { id } = req.query || {};
  const CREWAI_API_URL = process.env.CREWAI_API_URL;
  const CREWAI_API_KEY = process.env.CREWAI_API_KEY;

  if (!CREWAI_API_URL) {
    res.status(500).json({ detail: 'CREWAI_API_URL not configured' });
    return;
  }

  const baseUrl = CREWAI_API_URL.replace(/\/kickoff\/?$/, '').replace(/\/$/, '');
  const statusUrlsFor = (kickoffId) => [
    `${baseUrl}/status/${encodeURIComponent(kickoffId)}`,
    `${baseUrl}/${encodeURIComponent(kickoffId)}/status`
  ];

  try {
    const headers = { Accept: 'application/json' };
    if (CREWAI_API_KEY) {
      headers.Authorization = `Bearer ${CREWAI_API_KEY}`;
      headers['x-api-key'] = CREWAI_API_KEY;
    }

    let upstream;
    for (const url of statusUrlsFor(id)) {
      upstream = await fetch(url, { method: 'GET', headers });
      if (upstream.status !== 404) {
        break;
      }
    }

    const text = upstream ? await upstream.text() : '';
    res.status(upstream ? upstream.status : 502);
    res.setHeader('Content-Type', upstream ? upstream.headers.get('content-type') || 'application/json' : 'application/json');
    res.end(text);
  } catch (err) {
    res.status(502).json({ detail: 'Failed to fetch status', error: String(err) });
  }
}
