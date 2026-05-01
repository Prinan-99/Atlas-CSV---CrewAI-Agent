export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ detail: 'Method not allowed' });
    return;
  }

  const CREWAI_API_URL = process.env.CREWAI_API_URL;
  const CREWAI_API_KEY = process.env.CREWAI_API_KEY;

  if (!CREWAI_API_URL) {
    res.status(500).json({ detail: 'CREWAI_API_URL not configured' });
    return;
  }

  // read raw request body
  let body = '';
  try {
    if (req.body) {
      // Vercel may provide parsed body
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    } else {
      for await (const chunk of req) {
        body += chunk;
      }
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    if (CREWAI_API_KEY) {
      headers.Authorization = `Bearer ${CREWAI_API_KEY}`;
      headers['x-api-key'] = CREWAI_API_KEY;
    }

    const upstream = await fetch(CREWAI_API_URL, {
      method: 'POST',
      headers,
      body
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.end(text);
  } catch (err) {
    res.status(502).json({ detail: 'Failed to forward request', error: String(err) });
  }
}
