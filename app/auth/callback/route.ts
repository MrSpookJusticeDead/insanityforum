// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirect_to')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // If redirect_to is set and is our domain, use it
  if (redirectTo && redirectTo.startsWith(origin)) {
    return NextResponse.redirect(redirectTo)
  }

  return NextResponse.redirect(`${origin}/confirmed`)
}