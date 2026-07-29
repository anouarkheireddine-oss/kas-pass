import { createClient } from '@supabase/supabase-js'

// Fallback URLs prevent module-load errors during Next.js build (no requests are made at build time)
const url     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? 'https://placeholder.supabase.co'
const anon    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
const service = process.env.SUPABASE_SERVICE_ROLE_KEY    ?? 'placeholder-service-key'

// Browser / RSC client (anon key, respects RLS)
export const supabase = createClient(url, anon)

// Server-only admin client (service role, bypasses RLS — API routes only)
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
