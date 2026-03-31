// components/PresenceTracker.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function PresenceTracker({ userId }: { userId: string }) {
  const supabase = createClient()

  useEffect(() => {
    const updatePresence = async () => {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId)
    }

    // Update immediately on mount
    updatePresence()

    // Update every 30 seconds
    const interval = setInterval(updatePresence, 30000)

    // Update on tab focus
    const handleFocus = () => updatePresence()
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId, supabase])

  return null
}