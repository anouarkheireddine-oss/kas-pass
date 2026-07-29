import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type { KasPlan } from '@/lib/types'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { user_id, plan_id, billing_cycle } = session.metadata ?? {}

    if (!user_id || !plan_id || session.mode !== 'subscription') {
      return NextResponse.json({ received: true })
    }

    const { data: plan } = await db
      .from('kas_plans')
      .select('credits_per_month')
      .eq('id', plan_id)
      .single<Pick<KasPlan, 'credits_per_month'>>()

    if (!plan) return NextResponse.json({ received: true })

    const subId      = session.subscription as string
    const customerId = session.customer as string
    const stripeSub  = await stripe.subscriptions.retrieve(subId)

    await db.from('kas_subscriptions').upsert({
      user_id,
      plan_id,
      stripe_subscription_id: subId,
      stripe_customer_id: customerId,
      status: 'active',
      remaining_credits: plan.credits_per_month,
      billing_cycle: billing_cycle ?? 'monthly',
      current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' })
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const subId   = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id
    if (!subId) return NextResponse.json({ received: true })

    const stripeSub = await stripe.subscriptions.retrieve(subId)
    const plan_id   = stripeSub.metadata?.plan_id
    if (!plan_id) return NextResponse.json({ received: true })

    const { data: plan } = await db
      .from('kas_plans')
      .select('credits_per_month')
      .eq('id', plan_id)
      .single<Pick<KasPlan, 'credits_per_month'>>()

    if (!plan) return NextResponse.json({ received: true })

    await db.from('kas_subscriptions')
      .update({
        status: 'active',
        remaining_credits: plan.credits_per_month,
        current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subId)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    await db.from('kas_subscriptions')
      .update({
        status: sub.status as 'active' | 'past_due' | 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await db.from('kas_subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
