import { createHmac } from 'crypto'

const SECRET = process.env.PASS_TOKEN_SECRET!

// Produces a deterministic signed token: userId.timestamp.sig
export function signPassToken(userId: string): string {
  const ts  = Math.floor(Date.now() / 1000).toString(36)
  const msg = `${userId}.${ts}`
  const sig = createHmac('sha256', SECRET).update(msg).digest('hex').slice(0, 16)
  return Buffer.from(`${msg}.${sig}`).toString('base64url')
}

export function verifyPassToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [userId, ts, sig] = decoded.split('.')
    const msg      = `${userId}.${ts}`
    const expected = createHmac('sha256', SECRET).update(msg).digest('hex').slice(0, 16)
    if (sig !== expected) return null
    return userId
  } catch {
    return null
  }
}
