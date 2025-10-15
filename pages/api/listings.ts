import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET for listings
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed', allowed: ['GET'] })

  const target = process.env.LISTINGS_WEBHOOK
  if (!target) {
    // helpful, actionable response for missing configuration
    return res.status(500).json({ error: 'LISTINGS_WEBHOOK not configured on server', hint: 'Set LISTINGS_WEBHOOK in your environment or .env.local' })
  }

  try {
    const url = `${target}${target.includes('?') ? '&' : '?'}_=${Date.now()}`
    const r = await fetch(url, { method: 'GET' })
    const contentType = r.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await r.json()
      return res.status(r.status).json(json)
    }
    // If the upstream returned non-JSON, forward as text
    const text = await r.text()
    return res.status(r.status).send(text)
  } catch (err: any) {
    console.error('listings proxy error', err)
    return res.status(502).json({ error: 'proxy error', details: String(err), hint: 'Check LISTINGS_WEBHOOK connectivity and response format' })
  }
}
