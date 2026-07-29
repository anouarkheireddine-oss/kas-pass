import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { signPassToken } from '@/lib/pass-token'

export async function GET() {
  return handler()
}
export async function POST() {
  return handler()
}

async function handler() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ token: signPassToken(user.id) })
}
