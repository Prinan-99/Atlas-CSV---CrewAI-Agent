import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function crewAiProxyPlugin(apiKey, upstreamUrl) {
  const baseUrl = upstreamUrl.replace(/\/kickoff\/?$/, '').replace(/\/$/, '');
  const kickoffUrl = upstreamUrl.includes('/kickoff')
    ? upstreamUrl
    : `${baseUrl}/kickoff`;
  const statusUrlsFor = (kickoffId) => [
    `${baseUrl}/status/${encodeURIComponent(kickoffId)}`,
    `${baseUrl}/${encodeURIComponent(kickoffId)}/status`
  ];

  function buildAuthHeaders() {
    const headers = {
      Accept: 'application/json'
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
      headers['x-api-key'] = apiKey;
    }

    return headers;
  }

  return {
    name: 'crewai-kickoff-proxy',
    configureServer(server) {
      server.middlewares.use('/api/kickoff', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ detail: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const headers = buildAuthHeaders();
            headers['Content-Type'] = 'application/json';

            const upstream = await fetch(kickoffUrl, {
              method: 'POST',
              headers,
              body
            });

            const text = await upstream.text();
            res.statusCode = upstream.status;
            res.setHeader(
              'Content-Type',
              upstream.headers.get('content-type') || 'application/json'
            );
            res.end(text);
          } catch (error) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                detail: 'Failed to reach CrewAI endpoint',
                error: error instanceof Error ? error.message : String(error)
              })
            );
          }
        });

        req.on('error', () => {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ detail: 'Invalid request body' }));
        });
      });

      server.middlewares.use('/api/status', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ detail: 'Method not allowed' }));
          return;
        }

        const sourceUrl = req.originalUrl || req.url || '';
        let kickoffId = '';

        if (sourceUrl.includes('/api/status/')) {
          kickoffId = sourceUrl.split('/api/status/')[1].split('?')[0];
        } else {
          kickoffId = sourceUrl.replace(/^\//, '').split('?')[0];
        }

        if (!kickoffId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ detail: 'Missing kickoff id' }));
          return;
        }

        try {
          let upstream;

          for (const statusUrl of statusUrlsFor(kickoffId)) {
            upstream = await fetch(statusUrl, {
              method: 'GET',
              headers: buildAuthHeaders()
            });

            if (upstream.status !== 404) {
              break;
            }
          }

          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader(
            'Content-Type',
            upstream.headers.get('content-type') || 'application/json'
          );
          res.end(text);
        } catch (error) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              detail: 'Failed to fetch kickoff status',
              error: error instanceof Error ? error.message : String(error)
            })
          );
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const crewAiApiKey = env.CREWAI_API_KEY || process.env.CREWAI_API_KEY || '';
  const crewAiApiUrl =
    env.CREWAI_API_URL ||
    process.env.CREWAI_API_URL ||
    'https://web-scrapper-v1-d67589e7-e668-43ff-a78a-a3d-f80869cf.crewai.com/kickoff';

  return {
    plugins: [react(), crewAiProxyPlugin(crewAiApiKey, crewAiApiUrl)]
  };
});
