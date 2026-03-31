// app/login/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // ✅ Forgot password states
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user: existingUser } } = await supabase.auth.getUser()
    if (existingUser) {
      router.push('/')
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (
        error.message.toLowerCase().includes('invalid login credentials') ||
        error.message.toLowerCase().includes('invalid credentials') ||
        error.message.toLowerCase().includes('wrong password')
      ) {
        setError('Incorrect email or password.')
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email before logging in. Check your inbox.')
      } else if (error.message.toLowerCase().includes('too many requests')) {
        setError('Too many login attempts. Please wait a few minutes and try again.')
      } else if (error.message.toLowerCase().includes('user not found')) {
        setError('No account found with this email.')
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // ✅ Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: 'https://insanityforum.vercel.app/auth/callback?type=recovery&redirect_to=https://insanityforum.vercel.app/password-reset',
    })

    if (error) {
      setForgotError(error.message)
      setForgotLoading(false)
    } else {
      setForgotSent(true)
      setForgotLoading(false)
    }
  }

  // ✅ Forgot password view
  if (showForgot) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
          Reset Password
        </h1>

        <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

        {forgotSent ? (
          // Success
          <div>
            <div
              className="border p-4 mb-6"
              style={{ borderColor: '#5ec269' }}
            >
              <p className="text-sm mb-2" style={{ color: '#5ec269' }}>
                ✓ Reset email sent
              </p>
              <p className="text-xs" style={{ color: '#888' }}>
                We sent a password reset link to{' '}
                <span style={{ color: '#e0e0e0' }}>{forgotEmail}</span>.
                Check your inbox and follow the link.
              </p>
            </div>
            <p className="text-xs" style={{ color: '#555' }}>
              Didn&apos;t receive it? Check your spam folder.
            </p>
            <button
              onClick={() => {
                setShowForgot(false)
                setForgotSent(false)
                setForgotEmail('')
              }}
              className="text-xs mt-4 hover:underline"
              style={{ color: '#e05565' }}
            >
              ← Back to Login
            </button>
          </div>
        ) : (
          // Form
          <form className="space-y-5" onSubmit={handleForgotPassword}>
            <p className="text-xs" style={{ color: '#888' }}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {forgotError && (
              <div
                className="text-xs border px-3 py-2"
                style={{ color: '#e05565', borderColor: '#e05565' }}
              >
                {forgotError}
              </div>
            )}

            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs uppercase tracking-widest mb-2"
                style={{ color: '#888' }}
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={forgotLoading || !forgotEmail}
              className="w-full text-xs uppercase tracking-widest border px-4 py-3 transition-colors cursor-pointer disabled:opacity-50"
              style={{ color: '#e05565', borderColor: '#e05565' }}
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgot(false)
                setForgotError(null)
                setForgotEmail('')
              }}
              className="w-full text-xs uppercase tracking-widest hover:underline"
              style={{ color: '#555' }}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    )
  }

  // ✅ Normal login view
  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        Log In
      </h1>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <form className="space-y-5" onSubmit={handleLogin}>
        {error && (
          <div
            className="text-xs border px-3 py-2"
            style={{ color: '#e05565', borderColor: '#e05565' }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="••••••••"
          />
          {/* ✅ Forgot password link */}
          <button
            type="button"
            onClick={() => {
              setShowForgot(true)
              setForgotEmail(email) // pre-fill if they already typed email
            }}
            className="text-xs mt-1 hover:underline"
            style={{ color: '#555' }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-xs uppercase tracking-widest border px-4 py-3 transition-colors cursor-pointer disabled:opacity-50"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-xs text-center" style={{ color: '#888' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="link-hover" style={{ color: '#e05565' }}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}