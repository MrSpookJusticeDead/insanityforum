// components/MobileMenu.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Avatar from './Avatar'
import LogoutButton from './LogoutButton'

interface MobileMenuProps {
  user: {
    id: string
    email: string
    username: string
    avatar_url: string | null
    insanities: number
  } | null
}

export default function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-col justify-center items-center gap-1 w-8 h-8 cursor-pointer"
        aria-label="Menu"
      >
        <span
          className="block w-5 h-px transition-all duration-200"
          style={{
            backgroundColor: '#e05565',
            transform: open ? 'rotate(45deg) translateY(4px)' : 'none',
          }}
        />
        <span
          className="block w-5 h-px transition-all duration-200"
          style={{
            backgroundColor: '#e05565',
            opacity: open ? 0 : 1,
          }}
        />
        <span
          className="block w-5 h-px transition-all duration-200"
          style={{
            backgroundColor: '#e05565',
            transform: open ? 'rotate(-45deg) translateY(-4px)' : 'none',
          }}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 top-10 z-50 border w-56 py-2"
          style={{ backgroundColor: '#0e0e0e', borderColor: '#2a2a2a' }}
        >
          {/* Nav links */}
          <div className="border-b pb-2 mb-2" style={{ borderColor: '#2a2a2a' }}>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
              style={{ color: '#e05565' }}
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
              style={{ color: '#e05565' }}
            >
              Shop
            </Link>
            <Link
              href="/users"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
              style={{ color: '#e05565' }}
            >
              Users
            </Link>
          </div>

          {user ? (
            <>
              {/* Profile */}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:underline"
              >
                <Avatar url={user.avatar_url} username={user.username} size={20} />
                <span className="text-xs uppercase tracking-wide" style={{ color: '#e0e0e0' }}>
                  {user.username || user.email}
                </span>
              </Link>

              <Link
                href="/new-post"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
                style={{ color: '#5ec269' }}
              >
                New Post
              </Link>

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
                style={{ color: '#888' }}
              >
                ⚙ Settings
              </Link>

              <div className="border-t mt-2 pt-2 px-4" style={{ borderColor: '#2a2a2a' }}>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
                style={{ color: '#e0e0e0' }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-xs uppercase tracking-widest hover:underline"
                style={{ color: '#e05565' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}