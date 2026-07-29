'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { KasPlan, KasMerchant } from '@/lib/types'
import { Coffee, Star, MapPin, ChevronRight, Zap } from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = {
  cafe: '☕', bakery: '🥐', pub: '🍺', event: '🎟️',
}

function PricingCard({ plan, onSubscribe }: { plan: KasPlan; onSubscribe: (id: string) => void }) {
  const isVip = plan.name.toLowerCase().includes('vip')
  return (
    <div className={`relative rounded-2xl p-8 flex flex-col gap-6 border-2 transition-all ${
      isVip
        ? 'bg-[#1A1A1A] border-[#00A3E0] text-white'
        : 'bg-white border-[#E8EBF0] text-[#1A1A1A]'
    }`}>
      {isVip && (
        <span className="absolute -top-3 left-6 bg-[#00A3E0] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <div className="flex items-center gap-3">
        {isVip ? <Star size={22} className="text-[#00A3E0]" /> : <Coffee size={22} className="text-[#00A3E0]" />}
        <h3 className="font-serif font-bold text-xl">{plan.name}</h3>
      </div>
      <div>
        <span className="font-serif font-bold text-4xl">£{(plan.price_monthly / 100).toFixed(2)}</span>
        <span className={`text-sm ml-1 ${isVip ? 'text-white/60' : 'text-stone-400'}`}>/month</span>
      </div>
      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-sm">
          <Zap size={14} className="text-[#00A3E0] flex-shrink-0" />
          <span>{plan.credits_per_month} credits per month</span>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <Zap size={14} className="text-[#00A3E0] flex-shrink-0" />
          <span>Use at any KAS partner</span>
        </li>
        <li className="flex items-center gap-2 text-sm">
          <Zap size={14} className="text-[#00A3E0] flex-shrink-0" />
          <span>Digital QR pass, no app needed</span>
        </li>
        {isVip && (
          <li className="flex items-center gap-2 text-sm">
            <Zap size={14} className="text-[#00A3E0] flex-shrink-0" />
            <span>Priority partner events & previews</span>
          </li>
        )}
      </ul>
      <button
        onClick={() => onSubscribe(plan.id)}
        className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors ${
          isVip
            ? 'bg-[#00A3E0] text-white hover:bg-[#0091c7]'
            : 'bg-[#1A1A1A] text-white hover:bg-[#00A3E0]'
        }`}
      >
        Subscribe Now
      </button>
    </div>
  )
}

export default function KasHubPage() {
  const [plans, setPlans]       = useState<KasPlan[]>([])
  const [merchants, setMerchants] = useState<KasMerchant[]>([])
  const [loading, setLoading]   = useState(false)

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
      body: JSON.stringify({ plan_id }),
    })
    const json = await res.json()
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
        <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
          One subscription. Coffee, food, events. Scan at any KAS partner and skip the queue.
        </p>
        <a href="#plans" className="inline-block bg-[#00A3E0] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#0091c7] transition-colors">
          See Plans <ChevronRight className="inline" size={16} />
        </a>
      </section>

      {/* Pricing */}
      <section id="plans" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-serif font-bold text-3xl text-[#1A1A1A] text-center mb-10">Choose your pass</h2>
        {plans.length === 0 ? (
          <p className="text-center text-stone-400">Loading plans…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(p => (
              <PricingCard key={p.id} plan={p} onSubscribe={handleSubscribe} />
            ))}
          </div>
        )}
        {loading && <p className="text-center text-stone-400 mt-6 text-sm">Redirecting to checkout…</p>}
      </section>

      {/* Partners directory */}
      <section className="bg-[#F7F8FA] px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-[#1A1A1A] mb-2">KAS Partners</h2>
          <p className="text-stone-500 mb-8">Every venue below accepts your KAS Pass.</p>
          {merchants.length === 0 ? (
            <p className="text-stone-400 text-sm">Partners coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {merchants.map(m => (
                <div key={m.id} className="bg-white rounded-xl p-5 border border-[#E8EBF0] flex items-start gap-4">
                  <span className="text-3xl">{CATEGORY_EMOJI[m.category] ?? '📍'}</span>
                  <div>
                    <p className="font-serif font-bold text-[#1A1A1A]">{m.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[#00A3E0] mb-1">{m.category}</p>
                    {m.address && (
                      <p className="text-stone-400 text-xs flex items-center gap-1">
                        <MapPin size={10} /> {m.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </main>
  )
}
