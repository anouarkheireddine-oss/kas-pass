export interface KasPlan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_annual: number
  credits_per_month: number
  stripe_price_id_monthly: string | null
  stripe_price_id_annual: string | null
  active: boolean
  created_at: string
}

export interface KasSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'past_due' | 'canceled'
  remaining_credits: number
  billing_cycle: 'monthly' | 'annual'
  current_period_end: string
  created_at: string
  updated_at: string
  kas_plans?: KasPlan
}

export interface KasMerchant {
  id: string
  name: string
  slug: string
  neighborhood: string
  address: string
  perk_description: string
  image_url: string | null
  payout_rate_per_credit: number
  active: boolean
  created_at: string
}

export interface KasRedemption {
  id: string
  user_id: string
  merchant_id: string
  credits_used: number
  redeemed_at: string
}

export interface RedeemPayload {
  pass_token: string
  merchant_id: string
  pin: string
}

export interface RedeemResult {
  success: boolean
  remaining: number
  timestamp: string
  merchant_name: string
}
