import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassToken } from '@/lib/pass-token'
import { createHash } from 'crypto'
import type { RedeemResult } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse<RedeemResult | { error: string }>> {
  const { pass_token, merchant_id, pin } = await req.json() as {
    pass_token: string
    merchant_id: string
    pin: string
  }

  if (!pass_token || !merchant_id || !pin) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const user_id = verifyPassToken(pass_token)
  if (!user_id) {
    return NextResponse.json({ error: 'Invalid or expired pass' }, { status: 401 })
  }

  const db = supabaseAdmin()

  // Verify merchant and PIN
  const { data: merchant, error: mErr } = await db
    .from('kas_merchants')
    .select('id, name, secret_pin, active')
    .eq('id', merchant_id)
    .single<{ id: string; name: string; secret_pin: string; active: boolean }>()

  if (mErr || !merchant || !merchant.active) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const pinHash = createHash('sha256').update(pin).digest('hex')
  if (pinHash !== merchant.secret_pin) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 })
  }

  // Load active subscription
  const { data: sub, error: subErr } = await db
    .from('kas_subscriptions')
    .select('id, remaining_credits, status, current_period_end')
    .eq('user_id', user_id)
    .eq('status', 'active')
    .single<{ id: string; remaining_credits: number; status: string; current_period_end: string }>()

  if (subErr || !sub) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 402 })
  }

  if (sub.remaining_credits < 1) {
    return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
  }

  // Atomic decrement with optimistic lock
  const { data: updated, error: updateErr } = await db
    .from('kas_subscriptions')
    .update({
      remaining_credits: sub.remaining_credits - 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sub.id)
    .eq('remaining_credits', sub.remaining_credits)
    .select('remaining_credits')
    .single<{ remaining_credits: number }>()

  if (updateErr || !updated) {
    return NextResponse.json({ error: 'Concurrent update — please retry' }, { status: 409 })
  }

  // Record redemption
  await db.from('kas_redemptions').insert({
    user_id,
    merchant_id,
    credits_used: 1,
  })

  return NextResponse.json({
    success: true,
    remaining: updated.remaining_credits,
    timestamp: new Date().toISOString(),
    merchant_name: merchant.name,
  })
}
