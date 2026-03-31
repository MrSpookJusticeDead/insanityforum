// app/shop/page.tsx
import { createClient } from '@/lib/supabase/server'
import ShopClient from '@/components/ShopClient'

export default async function ShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from('shop_items')
    .select('*')
    .order('price', { ascending: true })

  let profile = null
  let ownedItemIds: string[] = []

  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('insanities, equipped_tag_id, last_daily_claim')
      .eq('id', user.id)
      .single()
    profile = p

    const { data: owned } = await supabase
      .from('user_items')
      .select('item_id')
      .eq('user_id', user.id)
    ownedItemIds = owned?.map((o) => o.item_id) || []
  }

  return (
    <ShopClient
      items={items || []}
      profile={profile}
      ownedItemIds={ownedItemIds}
      userId={user?.id}
    />
  )
}