// app/api/check-email/route.ts
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ exists: false })
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

  const { data } = await adminClient.auth.admin.listUsers()

  // Only count users who have confirmed their email
  const exists = data?.users?.some(
    (u) =>
      u.email?.toLowerCase() === email.toLowerCase() &&
      u.email_confirmed_at !== null
  )

  return NextResponse.json({ exists: !!exists })
}