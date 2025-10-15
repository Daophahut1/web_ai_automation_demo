import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed', allowed: ['POST'] })

  const target = process.env.OCR_WEBHOOK
  if (!target) {
    return res.status(500).json({ error: 'OCR_WEBHOOK not configured on server', hint: 'Set OCR_WEBHOOK in your environment or .env.local' })
  }

  // Minimal request validation
  if (!req.body || (!req.body.fileData && !req.body.file)) {
    return res.status(400).json({ error: 'Missing file payload. Expected { fileData: string, fileName?: string, fileMimeType?: string }' })
  }

  try {
    const r = await fetch(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) })
    const contentType = r.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await r.json()
      return res.status(r.status).json(json)
    }
    const text = await r.text()
    return res.status(r.status).send(text)
  } catch (err: any) {
    console.error('ocr proxy error', err)
    return res.status(502).json({ error: 'proxy error', details: String(err), hint: 'Check OCR_WEBHOOK connectivity and response format' })
  }
}
