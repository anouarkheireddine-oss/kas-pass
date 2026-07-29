import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type { KasPlan } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { plan_id, billing_cycle } = await req.json() as {
    plan_id: string
    billing_cycle?: 'monthly' | 'annual'
  }
  const cycle = billing_cycle ?? 'monthly'

  const db = supabaseAdmin()

  // Verify auth via cookie header
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authErr } = token
    ? await db.auth.getUser(token)
    : { data: { user: null }, error: new Error('No token') }

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: plan, error: planErr } = await db
    .from('kas_plans')
    .select('*')
    .eq('id', plan_id)
    .eq('active', true)
    .single<KasPlan>()

  if (planErr || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const priceId = cycle === 'annual'
    ? plan.stripe_price_id_annual
    : plan.stripe_price_id_monthly

  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for ${cycle} billing` }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/kas/pass?checkout=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/kas?checkout=cancelled`,
    metadata: { user_id: user.id, plan_id, billing_cycle: cycle },
    subscription_data: { metadata: { user_id: user.id, plan_id, billing_cycle: cycle } },
  })

  return NextResponse.json({ url: session.url })
}
