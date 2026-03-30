// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect_to')

  const supabase = await createClient()

  // Handle token_hash flow (from email confirmation links)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'email',
    })

    if (!error) {
      // Redirect to confirmed page or wherever redirect_to points
      if (redirectTo && redirectTo.startsWith('https://insanityforum.vercel.app')) {
        return NextResponse.redirect(redirectTo)
      }
      return NextResponse.redirect(`${origin}/confirmed`)
    }

    // If verification failed, redirect home
    return NextResponse.redirect(`${origin}/?error=confirmation_failed`)
  }

  // Handle code flow (OAuth, magic links)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (redirectTo && redirectTo.startsWith(origin)) {
    return NextResponse.redirect(redirectTo)
  }

  return NextResponse.redirect(`${origin}/`)
}