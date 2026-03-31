// components/Navbar.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import Avatar from './Avatar'
import NotificationBell from './NotificationBell'
import InsanityBalance from './InsanityBalance'
import MobileMenu from './MobileMenu'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, insanities')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav className="border-b" style={{ borderColor: '#2a2a2a' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">

          {/* Logo */}
          <Link
            href="/"
            className="text-base font-bold tracking-wide flex-shrink-0"
            style={{ color: '#e05565' }}
          >
            INSANITY FORUM
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-xs uppercase tracking-widest hover:underline" style={{ color: '#e05565' }}>Home</Link>
            <Link href="/shop" className="text-xs uppercase tracking-widest hover:underline" style={{ color: '#e05565' }}>Shop</Link>
            <Link href="/users" className="text-xs uppercase tracking-widest hover:underline" style={{ color: '#e05565' }}>Users</Link>
          </div>

          {/* Desktop right side — hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/new-post"
                  className="text-xs uppercase tracking-widest hover:underline"
                  style={{ color: '#5ec269' }}
                >
                  New Post
                </Link>
                <div
                  className="flex items-center gap-2 border px-3 py-1.5"
                  style={{ borderColor: '#2a2a2a' }}
                >
                  <Link href="/profile" className="flex items-center gap-2">
                    <Avatar url={profile?.avatar_url} username={profile?.username} size={24} />
                    <span className="text-xs uppercase tracking-wide hover:underline" style={{ color: '#e0e0e0' }}>
                      {profile?.username || user.email}
                    </span>
                  </Link>
                  <span style={{ color: '#2a2a2a' }}>|</span>
                  <NotificationBell userId={user.id} />
                  <span style={{ color: '#2a2a2a' }}>|</span>
                  <InsanityBalance userId={user.id} initialBalance={profile?.insanities ?? 0} />
                  <span style={{ color: '#2a2a2a' }}>|</span>
                  <Link href="/settings" className="text-xs hover:underline" style={{ color: '#888' }}>⚙</Link>
                  <span style={{ color: '#2a2a2a' }}>|</span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-xs uppercase tracking-widest hover:underline" style={{ color: '#e0e0e0' }}>Log In</Link>
                <Link href="/signup" className="text-xs uppercase tracking-widest border px-3 py-1.5" style={{ color: '#e05565', borderColor: '#e05565' }}>Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile right: avatar + bell + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <>
                <NotificationBell userId={user.id} />
                <InsanityBalance userId={user.id} initialBalance={profile?.insanities ?? 0} />
              </>
            )}
            <MobileMenu
              user={user ? {
                id: user.id,
                email: user.email ?? '',
                username: profile?.username ?? '',
                avatar_url: profile?.avatar_url ?? null,
                insanities: profile?.insanities ?? 0,
              } : null}
            />
          </div>

        </div>
      </div>
    </nav>
  )
}