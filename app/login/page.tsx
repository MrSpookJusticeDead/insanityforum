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
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Map Supabase error messages to friendly ones
      if (error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials') ||
          error.message.toLowerCase().includes('wrong password')) {
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