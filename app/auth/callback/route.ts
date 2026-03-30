// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const redirectTo = searchParams.get('redirect_to')

  const supabase = await createClient()

  // Handle token_hash flow (from email confirmation links)
  if (token_hash && type) {
    const { error, data } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'email',
    })

    if (!error && data.user) {
      // Generate a cryptographically secure one-time token
      const oneTimeToken = randomBytes(32).toString('hex')

      // Store it server-side using admin client (bypasses RLS)
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      await adminClient.from('confirmation_tokens').insert({
        user_id: data.user.id,
        token: oneTimeToken,
        used: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
      })

      // Redirect to /confirmed with the token in the URL
      return NextResponse.redirect(
        `${origin}/confirmed?token=${oneTimeToken}`
      )
    }

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