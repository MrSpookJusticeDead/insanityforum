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

    // Fetch latest balance from DB
    const fetchBalance = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('insanities')
        .eq('id', userId)
        .single()

      if (data && typeof data.insanities === 'number') {
        setBalance(data.insanities)
      }
    }

    // Try realtime first
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
          const updated = payload.new as Record<string, unknown>
          if (typeof updated.insanities === 'number') {
            setBalance(updated.insanities)
          }
        }
      )
      .subscribe((status) => {
        console.log('InsanityBalance realtime status:', status)
      })

    // Poll every 30 seconds as fallback
    const interval = setInterval(fetchBalance, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [userId])

  return (
    <span className="text-xs font-bold" style={{ color: '#e0a550' }}>
      {balance.toLocaleString()}✦
    </span>
  )
}