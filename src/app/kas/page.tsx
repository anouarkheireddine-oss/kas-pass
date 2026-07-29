'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { KasPlan, KasMerchant } from '@/lib/types'
import { Coffee, Star, ChevronRight, CheckCircle2, QrCode, RefreshCw, Store } from 'lucide-react'

// ─── How It Works ────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: '1',
    icon: Coffee,
    title: 'Choose Your Pass',
    body: 'Pick the plan that fits you. Instant digital activation — no app download needed.',
  },
  {
    num: '2',
    icon: QrCode,
    title: 'Show Your QR',
    body: 'Open your pass, scan at any partner counter in Coventry. Done in under 3 seconds.',
  },
  {
    num: '3',
    icon: RefreshCw,
    title: 'Enjoy & Save',
    body: 'Credits refresh automatically every month. Unused credits roll over — nothing wasted.',
  },
]

function HowItWorks() {
  return (
    <section className="bg-white px-4 py-16 border-b border-[#E8EBF0]">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#00A3E0] mb-3">
          Simple as it gets
        </p>
        <h2 className="font-serif font-bold text-3xl text-[#1A1A1A] text-center mb-12">
          How KAS Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {HOW_STEPS.map(({ num, icon: Icon, title, body }) => (
            <div key={num} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-[#00A3E0]/20 bg-[#00A3E0]/5 flex items-center justify-center">
                  <Icon size={24} className="text-[#00A3E0]" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00A3E0] text-white text-[11px] font-bold flex items-center justify-center">
                  {num}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'annual'

const PLAN_FEATURES: Record<string, string[]> = {
  coffee: [
    '6 Specialty Coffees / Drinks per month',
    'Valid at all KAS partner venues',
    'Rollover unused credits',
    'Digital QR pass — no app needed',
  ],
  vip: [
    '12 Specialty Coffees / Drinks + Pastries',
    'Priority access to Covlife events',
    '15% off all retail coffee beans',
    'Exclusive seasonal tasting invites',
    'Rollover unused credits',
    'Digital QR pass — no app needed',
  ],
}

function getPlanKey(name: string): 'vip' | 'coffee' {
  return name.toLowerCase().includes('vip') ? 'vip' : 'coffee'
}

function annualMonthly(priceMonthly: number): number {
  return Math.round(priceMonthly * 0.8)
}

interface PricingCardProps {
  plan: KasPlan
  cycle: BillingCycle
  onSubscribe: (id: string) => void
  loading: boolean
}

function PricingCard({ plan, cycle, onSubscribe, loading }: PricingCardProps) {
  const isVip = getPlanKey(plan.name) === 'vip'
  const features = PLAN_FEATURES[getPlanKey(plan.name)] ?? []
  const monthlyPence = plan.price_monthly
  const displayPence = cycle === 'annual' ? annualMonthly(monthlyPence) : monthlyPence
  const annualTotal  = (annualMonthly(monthlyPence) * 12) / 100

  return (
    <div className={`relative rounded-2xl p-8 flex flex-col gap-6 border-2 transition-all ${
      isVip
        ? 'bg-[#1A1A1A] border-[#00A3E0] text-white'
        : 'bg-white border-[#E8EBF0] text-[#1A1A1A]'
    }`}>
      {/* Badge */}
      {isVip && (
        <span className="absolute -top-3 left-6 bg-[#00A3E0] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Best Value
        </span>
      )}
      {cycle === 'annual' && !isVip && (
        <span className="absolute -top-3 left-6 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Save 20%
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        {isVip ? <Star size={22} className="text-[#00A3E0]" /> : <Coffee size={22} className="text-[#00A3E0]" />}
        <h3 className="font-serif font-bold text-xl">{plan.name}</h3>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-end gap-1">
          <span className="font-serif font-bold text-4xl">£{(displayPence / 100).toFixed(2)}</span>
          <span className={`text-sm mb-1 ${isVip ? 'text-white/60' : 'text-stone-400'}`}>/mo</span>
        </div>
        {cycle === 'annual' && (
          <p className={`text-xs mt-1 ${isVip ? 'text-white/50' : 'text-stone-400'}`}>
            Billed annually at £{annualTotal.toFixed(2)}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 size={15} className="text-[#00A3E0] flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50 ${
          isVip
            ? 'bg-[#00A3E0] text-white hover:bg-[#0091c7]'
            : 'bg-[#1A1A1A] text-white hover:bg-[#00A3E0]'
        }`}
      >
        {loading ? 'Redirecting…' : 'Get Started'}
      </button>
    </div>
  )
}

// ─── Neighborhood filter ──────────────────────────────────────────────────────

const NEIGHBORHOODS = ['All', 'City Centre', 'FarGo Village', 'Earlsdon', 'Leamington Spa'] as const
type Neighborhood = typeof NEIGHBORHOODS[number]

interface MerchantDirectoryProps {
  merchants: KasMerchant[]
}

function MerchantDirectory({ merchants }: MerchantDirectoryProps) {
  const [active, setActive] = useState<Neighborhood>('All')

  const filtered = active === 'All'
    ? merchants
    : merchants.filter(m => m.neighborhood === active)

  return (
    <section className="bg-[#F7F8FA] px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif font-bold text-3xl text-[#1A1A1A] mb-2">KAS Partners</h2>
        <p className="text-stone-500 mb-6">Every venue below accepts your KAS Pass.</p>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {NEIGHBORHOODS.map(n => (
            <button
              key={n}
              onClick={() => setActive(n)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                active === n
                  ? 'bg-[#00A3E0] text-white'
                  : 'bg-white border border-[#E8EBF0] text-stone-500 hover:border-[#00A3E0] hover:text-[#00A3E0]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {merchants.length === 0 ? (
          <p className="text-stone-400 text-sm">Partners coming soon.</p>
        ) : filtered.length === 0 ? (
          <p className="text-stone-400 text-sm">No partners in {active} yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => (
              <div
                key={m.id}
                className="bg-white rounded-xl p-5 border border-[#E8EBF0] flex flex-col gap-3 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">☕</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-[#1A1A1A] leading-snug">{m.name}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full mt-1">
                      📍 {m.neighborhood}
                    </span>
                  </div>
                </div>
                {m.perk_description && (
                  <p className="text-xs text-[#00A3E0] font-semibold border-t border-[#E8EBF0] pt-3">
                    Perk: {m.perk_description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Merchant acquisition banner ──────────────────────────────────────────────

function MerchantBanner() {
  return (
    <section className="bg-[#1A1A1A] px-4 py-14">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <Store size={36} className="text-[#00A3E0]" />
        <div>
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-white mb-3">
            Own an Independent Cafe, Bakery, or Venue in Coventry?
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Drive foot traffic and guaranteed monthly revenue with zero upfront setup fees.
          </p>
        </div>
        <a
          href="/partner/apply"
          className="inline-flex items-center gap-2 bg-[#00A3E0] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#0091c7] transition-colors text-sm uppercase tracking-widest"
        >
          Partner With Us <ChevronRight size={16} />
        </a>
      </div>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function KasHubPage() {
  const [plans, setPlans]         = useState<KasPlan[]>([])
  const [merchants, setMerchants] = useState<KasMerchant[]>([])
  const [cycle, setCycle]         = useState<BillingCycle>('monthly')
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    supabase.from('kas_plans').select('*').eq('active', true).then(({ data }) => {
      if (data) setPlans(data)
    })
    supabase.from('kas_merchants').select('*').eq('active', true).then(({ data }) => {
      if (data) setMerchants(data)
    })
  }, [])

  const handleSubscribe = async (plan_id: string) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/login?next=/kas'
      return
    }
    const res  = await fetch('/api/kas/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id, billing_cycle: cycle }),
    })
    const json = await res.json() as { url?: string }
    if (json.url) window.location.href = json.url
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white px-4 py-20 text-center">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#00A3E0] mb-4">
          Powered by Covlife
        </span>
        <h1 className="font-serif font-bold text-4xl md:text-6xl leading-tight mb-4">
          Unlock Coventry<br />with <span className="text-[#00A3E0]">KAS Pass</span>
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-6">
          Your VIP Access Key to Coventry&apos;s Best Independent Cafes, Bakeries &amp; Cultural Spots.
        </p>
        {/* Member benefits badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 text-xs font-semibold text-white/80 mb-8 flex-wrap justify-center">
          <span className="text-emerald-400 font-bold">✓</span> Save £35+/month
          <span className="text-white/30">•</span>
          <span className="text-emerald-400 font-bold">✓</span> Zero booking fees
          <span className="text-white/30">•</span>
          <span className="text-emerald-400 font-bold">✓</span> Exclusive partner perks
        </div>
        <div className="flex justify-center">
          <a
            href="#plans"
            className="inline-flex items-center gap-1 bg-[#00A3E0] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#0091c7] transition-colors"
          >
            See Plans <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Pricing */}
      <section id="plans" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-serif font-bold text-3xl text-[#1A1A1A] text-center mb-6">
          Choose your pass
        </h2>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-[#F7F8FA] border border-[#E8EBF0] rounded-full p-1">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                cycle === 'monthly'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-stone-400 hover:text-[#1A1A1A]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                cycle === 'annual'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-stone-400 hover:text-[#1A1A1A]'
              }`}
            >
              Annual <span className="text-emerald-500 ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        {plans.length === 0 ? (
          <p className="text-center text-stone-400">Loading plans…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(p => (
              <PricingCard
                key={p.id}
                plan={p}
                cycle={cycle}
                onSubscribe={handleSubscribe}
                loading={loading}
              />
            ))}
          </div>
        )}
      </section>

      {/* Partner directory */}
      <MerchantDirectory merchants={merchants} />

      {/* Merchant acquisition banner */}
      <MerchantBanner />

    </main>
  )
}
