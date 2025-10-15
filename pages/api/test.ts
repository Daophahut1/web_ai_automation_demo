import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed', allowed: ['GET'] })

  const target = process.env.TEST_WEBHOOK
  if (!target) {
    return res.status(500).json({ error: 'TEST_WEBHOOK not configured on server', hint: 'Set TEST_WEBHOOK in your environment or .env.local' })
  }

  try {
    const url = `${target}${target.includes('?') ? '&' : '?'}_=${Date.now()}`
    const r = await fetch(url, { method: 'GET' })
    const text = await r.text()
    return res.status(r.status).send(text)
  } catch (err: any) {
    console.error('test proxy error', err)
    return res.status(502).json({ error: 'proxy error', details: String(err), hint: 'Check TEST_WEBHOOK connectivity' })
  }
}
