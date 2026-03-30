// components/Navbar.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav className="border-b" style={{ borderColor: '#2a2a2a' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between h-14 items-center">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-lg font-bold tracking-wide"
              style={{ color: '#e05565' }}
            >
              INSANITY FORUM
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-xs uppercase tracking-widest link-hover"
                style={{ color: '#e05565' }}
              >
                Home
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/new-post"
                  className="text-xs uppercase tracking-widest link-hover"
                  style={{ color: '#5ec269' }}
                >
                  New Post
                </Link>
                <div
                  className="flex items-center gap-2 border px-3 py-1.5"
                  style={{ borderColor: '#2a2a2a' }}
                >
                  <span
                    className="text-xs uppercase tracking-wide"
                    style={{ color: '#e0e0e0' }}
                  >
                    {profile?.username || user.email}
                  </span>
                  <span style={{ color: '#2a2a2a' }}>|</span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-widest link-hover"
                  style={{ color: '#e0e0e0' }}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-xs uppercase tracking-widest border px-3 py-1.5 transition-colors"
                  style={{
                    color: '#e05565',
                    borderColor: '#e05565',
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}