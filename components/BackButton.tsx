// components/BackButton.tsx
'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallbackHref?: string
  fallbackLabel?: string
}

export default function BackButton({
  fallbackHref = '/',
  fallbackLabel = 'Back',
}: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="text-xs uppercase tracking-widest hover:underline inline-block mb-6 cursor-pointer"
      style={{ color: '#888' }}
    >
      ← {fallbackLabel}
    </button>
  )
}