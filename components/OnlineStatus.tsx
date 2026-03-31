// components/OnlineStatus.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface OnlineStatusProps {
  profileId: string
  initialLastSeen: string | null
}

function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false
  const diff = Date.now() - new Date(lastSeen).getTime()
  return diff < 2 * 60 * 1000 // 2 minutes
}

export default function OnlineStatus({ profileId, initialLastSeen }: OnlineStatusProps) {
  const [lastSeen, setLastSeen] = useState<string | null>(initialLastSeen)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('presence-' + profileId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`,
        },
        (payload) => {
          const updated = payload.new as { last_seen: string | null }
          setLastSeen(updated.last_seen)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, supabase])

  // Re-check every 30 seconds to flip offline when they leave
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const online = isOnline(lastSeen)

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: online ? '#5ec269' : '#555',
          flexShrink: 0,
        }}
      />
      <span
        className="text-xs"
        style={{ color: online ? '#5ec269' : '#555' }}
      >
        {online ? 'Online' : 'Offline'}
      </span>
    </div>
  )
}