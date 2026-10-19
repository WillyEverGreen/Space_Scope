// Vercel serverless proxy for api.nasa.gov so the key stays on the server.
// Set NASA_API_KEY (no VITE_ prefix) in the Vercel project settings.
const ENDPOINTS = {
  apod: 'planetary/apod',
  flr: 'DONKI/FLR',
  gst: 'DONKI/GST',
};
const PARAMS = ['date', 'startDate', 'endDate'];

export default async function handler(req, res) {
  const path = ENDPOINTS[req.query.endpoint];
  if (!path) {
    res.status(400).json({ error: 'Unknown endpoint' });
    return;
  }

  const qs = new URLSearchParams({ api_key: process.env.NASA_API_KEY || 'DEMO_KEY' });
  for (const name of PARAMS) {
    if (typeof req.query[name] === 'string') qs.set(name, req.query[name]);
  }

  try {
    const upstream = await fetch(`https://api.nasa.gov/${path}?${qs}`, { signal: AbortSignal.timeout(9000) });
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    // Cache at the edge so visitors share one upstream call and rate limits last longer
    if (upstream.ok) res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.status(upstream.status).send(await upstream.text());
  } catch {
    res.status(502).json({ error: 'NASA API unreachable' });
  }
}
