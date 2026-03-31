// app/api/check-email/route.ts
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ exists: false, verified: false })
  }

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

  // Use listUsers with a filter instead of fetching all
  const { data, error } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  })

  if (error || !data) {
    return NextResponse.json({ exists: false, verified: false })
  }

  const user = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )

  if (!user) {
    return NextResponse.json({ exists: false, verified: false })
  }

  // Log for debugging
  console.log('Found user:', {
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,
    confirmed: !!user.email_confirmed_at,
  })

  const verified = !!user.email_confirmed_at

  return NextResponse.json({
    exists: true,
    verified,
  })
}