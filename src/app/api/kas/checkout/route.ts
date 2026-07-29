import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { plan_id } = await req.json() as { plan_id: string }

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: plan, error: planErr } = await supabase
    .from('kas_plans')
    .select('*')
    .eq('id', plan_id)
    .eq('active', true)
    .single()

  if (planErr || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/kas/pass?checkout=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/kas?checkout=cancelled`,
    metadata: { user_id: user.id, plan_id },
    subscription_data: { metadata: { user_id: user.id, plan_id } },
  })

  return NextResponse.json({ url: session.url })
}
