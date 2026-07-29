export interface KasPlan {
  id: string
  name: string
  price_monthly: number
  credits_per_month: number
  stripe_price_id: string
  active: boolean
  created_at: string
}

export interface KasSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string
  status: 'active' | 'past_due' | 'canceled'
  remaining_credits: number
  current_period_end: string
  created_at: string
  updated_at: string
  kas_plans?: KasPlan
}

export interface KasMerchant {
  id: string
  name: string
  slug: string
  address: string | null
  category: 'cafe' | 'bakery' | 'pub' | 'event'
  payout_rate_per_credit: number
  active: boolean
  created_at: string
}

export interface KasRedemption {
  id: string
  user_id: string
  merchant_id: string
  subscription_id: string
  credit_amount: number
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
