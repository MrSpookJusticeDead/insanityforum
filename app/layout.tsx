// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import PresenceTracker from '@/components/PresenceTracker'

export const metadata: Metadata = {
  title: 'Insanity Forum',
  description: 'Community forum',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <Navbar />
          {/* Track presence for logged-in users across all pages */}
          {user && <PresenceTracker userId={user.id} />}
          <main className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}