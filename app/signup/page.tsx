// app/signup/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resent, setResent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Check if already logged in
    const { data: { user: existingUser } } = await supabase.auth.getUser()
    if (existingUser) {
      router.push('/')
      router.refresh()
      return
    }

    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      setError('This username is already taken.')
      setLoading(false)
      return
    }

    // Check if email exists and its verification status
    const emailCheck = await fetch('/api/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const result = await emailCheck.json()
    console.log('Email check result:', result)
    const { exists, verified } = result

    // Email exists and is verified → already a full account
    if (exists && verified) {
      setError('Someone is already using this email. Try logging in instead.')
      setLoading(false)
      return
    }

    // Email exists but NOT verified → resend confirmation email
    if (exists && !verified) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (resendError) {
        setError('Failed to resend confirmation email. Please try again.')
        setLoading(false)
        return
      }

      setResent(true)
      setSuccess(true)
      setLoading(false)
      return
    }

    // New email — proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('password')) {
        setError('Password must be at least 6 characters.')
      } else if (error.message.toLowerCase().includes('email')) {
        setError('Please enter a valid email address.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setSuccess(true)
      setLoading(false)
      return
    }

    if (data.session) {
      setSuccess(true)
      setLoading(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
          Check Your Email
        </h1>

        <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

        <div
          className="border p-4 mb-6"
          style={{ borderColor: '#5ec269' }}
        >
          <p className="text-sm mb-2" style={{ color: '#5ec269' }}>
            {resent ? '↻ Confirmation email resent' : '✓ Account created successfully'}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>
            {resent
              ? 'We resent the confirmation email to '
              : 'We sent a confirmation email to '}
            <span style={{ color: '#e0e0e0' }}>{email}</span>.
            Click the link in the email to activate your account.
          </p>
        </div>

        {resent && (
          <div
            className="border px-3 py-2 mb-4 text-xs"
            style={{ borderColor: '#2a2a2a', color: '#888' }}
          >
            ℹ️ You previously signed up with this email but never confirmed it.
            A new confirmation link has been sent.
          </div>
        )}

        <p className="text-xs" style={{ color: '#555' }}>
          Didn&apos;t receive it? Check your spam folder.
        </p>

        <p className="text-xs mt-4" style={{ color: '#555' }}>
          Already confirmed?{' '}
          <Link href="/login" className="hover:underline" style={{ color: '#e05565' }}>
            Log in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        Create Account
      </h1>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <form className="space-y-5" onSubmit={handleSignUp}>
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
            htmlFor="username"
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="Choose a username"
            minLength={3}
            maxLength={20}
          />
        </div>

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
            minLength={6}
          />
          <p className="text-xs mt-1" style={{ color: '#555' }}>
            Minimum 6 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-xs uppercase tracking-widest border px-4 py-3 transition-colors cursor-pointer disabled:opacity-50"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {loading ? 'Please wait...' : 'Sign Up'}
        </button>

        <p className="text-xs text-center" style={{ color: '#888' }}>
          Already have an account?{' '}
          <Link href="/login" className="link-hover" style={{ color: '#e05565' }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}