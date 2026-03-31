// app/password-reset/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordResetPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user has an active session (set by verifyOtp in callback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/')
      } else {
        setReady(true)
      }
    })
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    }
  }

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e0e0e',
        }}
      >
        <p style={{ color: '#555', fontFamily: "'Courier New', monospace", fontSize: '13px' }}>
          Verifying...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          maxWidth: '420px',
          width: '100%',
          padding: '32px',
          border: '1px solid #2a2a2a',
          backgroundColor: '#151515',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pinimg.com/originals/d0/96/54/d09654861c86dfe6cf766d6dbd22c501.gif"
            alt=""
            style={{
              width: '17%',
              border: '2px solid #e05565',
              display: 'block',
              margin: '0 auto 16px',
            }}
          />
          <h1
            style={{
              color: '#e05565',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontSize: '18px',
              margin: '0 0 8px',
            }}
          >
            ░ Reset Password
          </h1>
          <p style={{ color: '#888', fontSize: '11px', letterSpacing: '1px', margin: 0 }}>
            INSANITY FORUM — PASSWORD RECOVERY
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #2a2a2a', margin: '20px 0' }} />

        {success ? (
          // ✅ Success state
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#5ec269', fontSize: '14px', marginBottom: '8px' }}>
              ✓ Password updated successfully!
            </p>
            <p style={{ color: '#555', fontSize: '12px' }}>
              Redirecting you to the forum...
            </p>
          </div>
        ) : (
          // 📝 Form
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  border: '1px solid #e05565',
                  color: '#e05565',
                  fontSize: '12px',
                  padding: '8px 12px',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#888',
                  marginBottom: '6px',
                }}
              >
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0e0e0e',
                  border: '1px solid #2a2a2a',
                  color: '#e0e0e0',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#888',
                  marginBottom: '6px',
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repeat password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#0e0e0e',
                  border: '1px solid #2a2a2a',
                  color: '#e0e0e0',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#2a2a2a' : '#e05565',
                color: '#fff',
                border: '2px solid #e05565',
                fontFamily: "'Courier New', monospace",
                fontSize: '13px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Updating...' : '▶ Update Password'}
            </button>
          </form>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #2a2a2a', margin: '20px 0' }} />

        <p style={{ color: '#444', fontSize: '11px', textAlign: 'center', margin: 0 }}>
          Insanity Forum — Password Recovery
        </p>
      </div>
    </div>
  )
}