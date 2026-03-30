// app/signup/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-xs uppercase tracking-widest border px-4 py-3 transition-colors cursor-pointer disabled:opacity-50"
          style={{
            color: '#e05565',
            borderColor: '#e05565',
          }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
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