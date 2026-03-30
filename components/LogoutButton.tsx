// components/LogoutButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 hover:text-red-800 font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
    >
      🚪 Log Out
    </button>
  )
}