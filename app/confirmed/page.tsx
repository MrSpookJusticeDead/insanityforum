// app/confirmed/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Remove searchParams entirely — it was unused
export default async function ConfirmedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  if (!user.email_confirmed_at) {
    redirect('/')
  }

  // Fix: use new Date() instead of Date.now() for server components
  const confirmedAt = new Date(user.email_confirmed_at).getTime()
  const now = new Date().getTime()
  const twoMinutes = 2 * 60 * 1000

  if (now - confirmedAt > twoMinutes) {
    redirect('/')
  }

  return (
    <div
      style={{
        background: '#0e0e0e',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          maxWidth: '480px',
          width: '100%',
          margin: '0 auto',
          padding: '32px',
          border: '1px solid #2a2a2a',
          backgroundColor: '#151515',
          textAlign: 'center',
        }}
      >
        {/* Glitch image — eslint-disable for external gif */}
        <div style={{ marginBottom: '24px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pinimg.com/originals/d0/96/54/d09654861c86dfe6cf766d6dbd22c501.gif"
            alt="confirmation"
            style={{
              width: '17%',
              border: '2px solid #e05565',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        <h1
          style={{
            color: '#e05565',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontSize: '20px',
            margin: '0 0 12px',
          }}
        >
          ░ Email Confirmed
        </h1>

        <p
          style={{
            color: '#888',
            fontSize: '12px',
            letterSpacing: '1px',
            marginBottom: '24px',
          }}
        >
          INSANITY FORUM — ACCOUNT ACTIVATED
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #2a2a2a', margin: '20px 0' }} />

        <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
          Welcome,{' '}
          <span style={{ color: '#e05565', fontWeight: 'bold' }}>
            {user.email}
          </span>
        </p>

        <p style={{ color: '#888', fontSize: '13px', marginBottom: '32px' }}>
          Your account is now active. You can start posting.
        </p>

        <Link
          href="/"
          style={{
            background: '#e05565',
            color: '#fff',
            fontWeight: 'bold',
            textDecoration: 'none',
            padding: '14px 32px',
            display: 'inline-block',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '13px',
            border: '2px solid #e05565',
          }}
        >
          ▶ Enter the Forum
        </Link>

        <p
          style={{
            color: '#444',
            fontSize: '11px',
            marginTop: '32px',
          }}
        >
          This page is only accessible once.
        </p>
      </div>
    </div>
  )
}