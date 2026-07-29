'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { RedeemResult } from '@/lib/types'

type ScanState = 'idle' | 'scanning' | 'success' | 'error'

const CHIME_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA' // placeholder — replace with real chime

export default function PartnerScanPage() {
  const [merchantId, setMerchantId] = useState('')
  const [pin, setPin]               = useState('')
  const [authed, setAuthed]         = useState(false)
  const [state, setState]           = useState<ScanState>('idle')
  const [result, setResult]         = useState<RedeemResult | null>(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const scannerRef                  = useRef<HTMLDivElement>(null)
  const scannerInstance             = useRef<unknown>(null)
  const processingRef               = useRef(false)

  const playChime = () => {
    try {
      const ctx  = new AudioContext()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  const handleScan = useCallback(async (token: string) => {
    if (processingRef.current) return
    processingRef.current = true
    setState('scanning')

    try {
      const res = await fetch('/api/kas/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass_token: token, merchant_id: merchantId, pin }),
      })
      const json = await res.json()

      if (res.ok && json.success) {
        setResult(json)
        setState('success')
        playChime()
        setTimeout(() => { setState('idle'); processingRef.current = false }, 3000)
      } else {
        setErrorMsg(json.error ?? 'Redemption failed')
        setState('error')
        setTimeout(() => { setState('idle'); processingRef.current = false }, 3000)
      }
    } catch {
      setErrorMsg('Network error — please retry')
      setState('error')
      setTimeout(() => { setState('idle'); processingRef.current = false }, 3000)
    }
  }, [merchantId, pin])

  useEffect(() => {
    if (!authed || !scannerRef.current) return

    let stopped = false
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (stopped) return
      const scanner = new Html5Qrcode(scannerRef.current!.id)
      scannerInstance.current = scanner
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => { handleScan(text) },
        () => {}
      ).catch(() => {})
    })

    return () => {
      stopped = true
      const s = scannerInstance.current as { stop?: () => Promise<void> } | null
      s?.stop?.().catch(() => {})
    }
  }, [authed, handleScan])

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center mb-2">
          <p className="text-[#00A3E0] text-[10px] font-bold uppercase tracking-widest mb-1">KAS Partner</p>
          <h1 className="font-serif font-bold text-white text-2xl">Scanner Login</h1>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="text"
            placeholder="Merchant ID"
            value={merchantId}
            onChange={e => setMerchantId(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A3E0]"
          />
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A3E0]"
          />
          <button
            onClick={() => { if (merchantId && pin) setAuthed(true) }}
            className="w-full bg-[#00A3E0] text-white font-bold py-3 rounded-xl hover:bg-[#0091c7] transition-colors"
          >
            Open Scanner
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-4 gap-6">

      <div className="text-center">
        <p className="text-[#00A3E0] text-[10px] font-bold uppercase tracking-widest">KAS Partner Scanner</p>
        <p className="text-white/40 text-xs mt-1">Point camera at customer's QR code</p>
      </div>

      {/* QR viewport */}
      <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-2 border-[#00A3E0]/40">
        <div id="kas-qr-scanner" ref={scannerRef} className="w-full h-full" />

        {/* Overlay states */}
        {state === 'scanning' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#00A3E0] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {state === 'success' && (
          <div className="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center gap-3 animate-in fade-in">
            <span className="text-5xl">✓</span>
            <p className="text-white font-bold text-lg">Redeemed!</p>
            <p className="text-white/80 text-sm">{result?.remaining} credits left</p>
          </div>
        )}
        {state === 'error' && (
          <div className="absolute inset-0 bg-red-500/95 flex flex-col items-center justify-center gap-3">
            <span className="text-5xl">✕</span>
            <p className="text-white font-bold text-sm text-center px-4">{errorMsg}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => { setAuthed(false); setPin(''); setMerchantId('') }}
        className="text-white/40 text-xs hover:text-white/70 transition-colors"
      >
        Sign out
      </button>
    </main>
  )
}
