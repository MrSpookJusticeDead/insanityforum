// app/api/clear-confirmed-cookie/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect('https://insanityforum.vercel.app/')

  // Delete the one-time cookie
  response.cookies.set('just_confirmed', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}