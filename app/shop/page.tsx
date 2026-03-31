// app/shop/page.tsx
import { createClient } from '@/lib/supabase/server'
import ShopClient from '@/components/ShopClient'

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Run items fetch always, user queries in parallel if logged in
  if (user) {
    // All 3 queries at the same time ✅
    const [itemsRes, profileRes, ownedRes] = await Promise.all([
      supabase.from('shop_items').select('*').order('price', { ascending: true }),
      supabase.from('profiles').select('insanities, equipped_tag_id, last_daily_claim').eq('id', user.id).single(),
      supabase.from('user_items').select('item_id').eq('user_id', user.id),
    ])

    return (
      <ShopClient
        items={itemsRes.data || []}
        profile={profileRes.data}
        ownedItemIds={ownedRes.data?.map((o) => o.item_id) || []}
        userId={user.id}
      />
    )
  }

  // Not logged in — only fetch items
  const { data: items } = await supabase
    .from('shop_items')
    .select('*')
    .order('price', { ascending: true })

  return (
    <ShopClient
      items={items || []}
      profile={null}
      ownedItemIds={[]}
      userId={undefined}
    />
  )
}

// Cache shop items for 60 seconds
export const revalidate = 60