// lib/supabase/getNavbarProfile.ts
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getNavbarProfile(userId: string) {
  //  Create client OUTSIDE the cache
  const supabase = await createClient()

  //  Pass the supabase query result into cache, not the client itself..
  const getCachedProfile = unstable_cache(
    async (id: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, insanities')
        .eq('id', id)
        .single()
      return data
    },
    [`navbar-profile-${userId}`],
    { revalidate: 30, tags: [`profile-${userId}`] }
  )

  return getCachedProfile(userId)
}