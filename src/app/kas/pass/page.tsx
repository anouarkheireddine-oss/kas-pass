'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { KasSubscription } from '@/lib/types'
import QRCode from 'react-qr-code'
import { RefreshCw, LogOut } from 'lucide-react'

export default function KasPassPage() {
  const [sub, setSub]           = useState<KasSubscription | null>(null)
  const [passToken, setPassToken] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [userId, setUserId]     = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/auth/login?next=/kas/pass'; return }
      setUserId(user.id)

      // Load subscription with plan name
      const { data } = await supabase
        .from('kas_subscriptions')
        .select('*, kas_plans(name, credits_per_month)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setSub(data)

      // Get signed pass token from server
      const res = await fetch('/api/kas/pass-token')
      const json = await res.json()
      setPassToken(json.token ?? null)
      setLoading(false)
    })
  }, [])

  const renewToken = async () => {
    const res  = await fetch('/api/kas/pass-token', { method: 'POST' })
    const json = await res.json()
    setPassToken(json.token ?? null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00A3E0] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!sub) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="font-serif font-bold text-white text-3xl">No active pass</h1>
        <p className="text-white/60">Subscribe to a KAS plan to get your digital pass.</p>
        <a href="/kas" className="bg-[#00A3E0] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#0091c7] transition-colors">
          See Plans
        </a>
      </main>
    )
  }

  const plan = sub.kas_plans
  const total = plan?.credits_per_month ?? 0
  const used  = total - sub.remaining_credits
  const pct   = total > 0 ? (sub.remaining_credits / total) * 100 : 0
  const periodEnd = new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-4 py-10 gap-8">

      {/* Pass card */}
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Card header */}
        <div className="bg-[#00A3E0] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">KAS Pass</p>
            <p className="text-white font-serif font-bold text-xl">{plan?.name ?? 'Pass'}</p>
          </div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Active</span>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-8 px-6 bg-white">
          {passToken ? (
            <div className="p-3 border-2 border-[#E8EBF0] rounded-2xl">
              <QRCode value={passToken} size={180} fgColor="#1A1A1A" />
            </div>
          ) : (
            <div className="w-[180px] h-[180px] bg-stone-100 rounded-xl flex items-center justify-center text-stone-300 text-sm">
              Loading…
            </div>
          )}
        </div>

        {/* Credits */}
        <div className="px-6 pb-6">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-serif font-bold text-[#1A1A1A] text-lg">
              {sub.remaining_credits} of {total} credits
            </span>
            <span className="text-stone-400 text-xs">Resets {periodEnd}</span>
          </div>
          <div className="w-full bg-[#E8EBF0] rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-[#00A3E0] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-stone-400 text-xs mt-2">{used} used this month</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={renewToken}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <RefreshCw size={14} /> Refresh QR
        </button>
        <button
          onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <p className="text-white/30 text-xs text-center max-w-xs">
        Show this QR code at any KAS partner. The code refreshes automatically for security.
      </p>
    </main>
  )
}
