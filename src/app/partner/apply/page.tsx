'use client'

import { useState } from 'react'
import { Coffee, MapPin, TrendingUp, Zap, ChevronRight, CheckCircle2 } from 'lucide-react'

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Guaranteed Monthly Revenue',
    body: 'Every credit redeemed at your venue is paid out at £1.70. Predictable income regardless of footfall fluctuations.',
  },
  {
    icon: Zap,
    title: 'Zero Setup Fees',
    body: 'No upfront costs, no hardware to buy. Your scanner is a browser page — any phone or tablet works.',
  },
  {
    icon: Coffee,
    title: 'Drive New Customers',
    body: 'KAS Pass members actively seek out partner venues. You get listed in our partner directory and Covlife editorial.',
  },
  {
    icon: MapPin,
    title: 'Stay Local',
    body: "KAS is built exclusively for independent Coventry businesses. We don't partner with chains.",
  },
]

interface FormState {
  venueName: string
  ownerName: string
  email: string
  phone: string
  neighborhood: string
  address: string
  category: string
  description: string
}

const INITIAL: FormState = {
  venueName: '',
  ownerName: '',
  email: '',
  phone: '',
  neighborhood: '',
  address: '',
  category: '',
  description: '',
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function PartnerApplyPage() {
  const [form, setForm]   = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<SubmitState>('idle')

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      // Submit to a simple API endpoint or a form service
      // For now, sends to /api/kas/partner-apply when wired up
      await fetch('/api/kas/partner-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = `
    w-full bg-white border border-[#E8EBF0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A]
    placeholder-stone-400 focus:outline-none focus:border-[#00A3E0] transition-colors
  `

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white px-4 py-16 text-center">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-[#00A3E0] mb-4">
          KAS Partner Programme
        </span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl leading-tight mb-4">
          Grow Your Venue With<br />
          <span className="text-[#00A3E0]">Guaranteed Monthly Revenue</span>
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          Join Coventry&apos;s fastest-growing independent venue network.
          Zero upfront fees. Real foot traffic. Predictable payouts.
        </p>
      </section>

      {/* Benefits grid */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] text-center mb-10">
          Why partner with KAS?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 p-6 border border-[#E8EBF0] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-[#00A3E0]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#1A1A1A] mb-1">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How payout works */}
      <section className="bg-[#F7F8FA] px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] mb-4">How payouts work</h2>
          <p className="text-stone-500 mb-8">
            Each KAS credit redeemed at your venue earns you <strong className="text-[#1A1A1A]">£1.70</strong>.
            Payouts are processed monthly via bank transfer. If you serve 100 coffees in a month through KAS,
            that&apos;s <strong className="text-[#1A1A1A]">£170 guaranteed</strong> — on top of your regular trade.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Per credit redeemed', value: '£1.70' },
              { label: 'Setup fee', value: '£0' },
              { label: 'Monthly payout cycle', value: '30 days' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-[#E8EBF0]">
                <p className="font-serif font-bold text-[#00A3E0] text-2xl">{value}</p>
                <p className="text-stone-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="max-w-xl mx-auto px-4 py-16">
        <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] text-center mb-2">
          Apply to join KAS
        </h2>
        <p className="text-stone-500 text-center text-sm mb-8">
          We review all applications within 48 hours. Independent venues only.
        </p>

        {status === 'success' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <h3 className="font-serif font-bold text-[#1A1A1A] text-xl">Application received!</h3>
            <p className="text-stone-500 text-sm">
              We&apos;ll be in touch within 48 hours to arrange your onboarding call.
            </p>
            <a href="/kas" className="text-[#00A3E0] font-bold text-sm hover:underline">
              ← Back to KAS Pass
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Venue Name *</label>
                <input
                  required
                  className={inputCls}
                  placeholder="Bean & Leaf Coffee"
                  value={form.venueName}
                  onChange={set('venueName')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Your Name *</label>
                <input
                  required
                  className={inputCls}
                  placeholder="Jane Smith"
                  value={form.ownerName}
                  onChange={set('ownerName')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Email *</label>
                <input
                  required
                  type="email"
                  className={inputCls}
                  placeholder="hello@yourvenue.co.uk"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Phone</label>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="07700 900000"
                  value={form.phone}
                  onChange={set('phone')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Neighbourhood *</label>
                <select required className={inputCls} value={form.neighborhood} onChange={set('neighborhood')}>
                  <option value="">Select…</option>
                  <option>City Centre</option>
                  <option>FarGo Village</option>
                  <option>Earlsdon</option>
                  <option>Leamington Spa</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Category *</label>
                <select required className={inputCls} value={form.category} onChange={set('category')}>
                  <option value="">Select…</option>
                  <option>Cafe / Coffee Shop</option>
                  <option>Bakery</option>
                  <option>Tea Room</option>
                  <option>Cultural Venue</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Address *</label>
              <input
                required
                className={inputCls}
                placeholder="14 Broadgate, Coventry CV1 1NG"
                value={form.address}
                onChange={set('address')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                What would you offer KAS members?
              </label>
              <textarea
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="e.g. Specialty coffee & pastries, seasonal filter coffees…"
                value={form.description}
                onChange={set('description')}
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">
                Something went wrong — please email us at kas@covlife.co.uk
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-[#00A3E0] text-white font-bold py-3.5 rounded-xl hover:bg-[#0091c7] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              {status === 'submitting' ? 'Sending…' : (
                <>Submit Application <ChevronRight size={16} /></>
              )}
            </button>

            <p className="text-stone-400 text-xs text-center">
              We review all applications within 48 hours. By applying you agree to our partner terms.
            </p>
          </form>
        )}
      </section>

    </main>
  )
}
