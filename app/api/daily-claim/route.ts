// app/api/daily-claim/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_daily_claim, insanities')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Check if already claimed today
  if (profile.last_daily_claim) {
    const lastClaim = new Date(profile.last_daily_claim)
    const now = new Date()
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60)

    if (diffHours < 24) {
      const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
      return NextResponse.json({
        error: 'Already claimed today',
        nextClaim: nextClaim.toISOString(),
      }, { status: 400 })
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      insanities: profile.insanities + 100,
      last_daily_claim: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, earned: 100 })
}