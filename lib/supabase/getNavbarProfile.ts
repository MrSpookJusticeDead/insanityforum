// lib/supabase/getNavbarProfile.ts
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export const getNavbarProfile = async (userId: string) =>
  unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, insanities')
        .eq('id', userId)
        .single()
      return data
    },
    [`navbar-profile-${userId}`],
    { revalidate: 30, tags: [`profile-${userId}`] } // revalidate every 30s
  )()