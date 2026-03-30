// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Insanity Forum',
  description: 'Community forum',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <Navbar />
          <main className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}