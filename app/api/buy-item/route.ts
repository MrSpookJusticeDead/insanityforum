// app/api/buy-item/route.ts
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { itemId } = await request.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Get item
  const { data: item } = await supabase
    .from('shop_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // Check exclusive access
  if (item.exclusive) {
    const allowedIds: string[] = item.exclusive_user_ids ?? []
    if (!allowedIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'This tag is exclusive and cannot be purchased' },
        { status: 403 }
      )
    }
  }

  const isFreeForOwner = item.exclusive &&
    (item.exclusive_user_ids ?? []).includes(user.id)
  const cost = isFreeForOwner ? 0 : item.price

  // Atomic purchase — handles race conditions at DB level
  const { data: result, error } = await adminClient.rpc('purchase_item', {
    p_user_id: user.id,
    p_item_id: itemId,
    p_cost: cost,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (result === 'already_owned') {
    return NextResponse.json({ error: 'You already own this item' }, { status: 400 })
  }

  if (result === 'insufficient_funds') {
    return NextResponse.json({ error: 'Not enough Insanities' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}