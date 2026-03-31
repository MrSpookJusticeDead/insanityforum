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
  const supabase = createClient()

  useEffect(() => {
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
          const updated = payload.new as { insanities: number }
          if (typeof updated.insanities === 'number') {
            setBalance(updated.insanities)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <span className="text-xs font-bold" style={{ color: '#e0a550' }}>
      {balance.toLocaleString()}✦
    </span>
  )
}