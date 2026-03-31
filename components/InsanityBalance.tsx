// components/InsanityBalance.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
    let channel: RealtimeChannel | null = null

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

    const subscribe = () => {
      channel = supabase
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
          console.log('InsanityBalance status:', status)

          if (status === 'CHANNEL_ERROR') {
            // Remove and resubscribe after short delay
            if (channel) {
              supabase.removeChannel(channel)
              channel = null
            }
            setTimeout(() => {
              subscribe()
            }, 400)
          }

          if (status === 'CLOSED') {
            channel = null
          }
        })
    }

    subscribe()

    // Resubscribe when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden && channel === null) {
        subscribe()
        fetchBalance() // catch any missed updates
      }
    }

    // Resubscribe when window gets focus
    const handleFocus = () => {
      if (channel === null) {
        subscribe()
        fetchBalance()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      if (channel) supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  return (
    <span className="text-xs font-bold" style={{ color: '#e0a550' }}>
      {balance.toLocaleString()}✦
    </span>
  )
}