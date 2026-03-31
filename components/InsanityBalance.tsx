// components/InsanityBalance.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function InsanityBalance({
  userId,
  initialBalance,
}: {
  userId: string
  initialBalance: number
}) {
  const [balance, setBalance] = useState(initialBalance)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('insanities-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('Profile update received:', payload.new)
          const updated = payload.new as Record<string, unknown>
          if (typeof updated.insanities === 'number') {
            setBalance(updated.insanities)
          }
        }
      )
      .subscribe((status) => {
        console.log('InsanityBalance realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <span className="text-xs font-bold" style={{ color: '#e0a550' }}>
      {balance.toLocaleString()}✦
    </span>
  )
}