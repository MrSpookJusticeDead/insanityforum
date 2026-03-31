// app/api/buy-item/route.ts
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
//import { DEVELOPER_ID } from '@/lib/developer'

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

  // Check exclusive
  if (item.exclusive) {
  const allowedIds: string[] = item.exclusive_user_ids ?? []
  if (!allowedIds.includes(user.id)) {
    return NextResponse.json({ error: 'This tag is exclusive and cannot be purchased' }, { status: 403 })
  }
}

  // Check if already owned
  const { data: existingItem } = await supabase
    .from('user_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .single()

  if (existingItem) {
    return NextResponse.json({ error: 'You already own this item' }, { status: 400 })
  }

  // Get profile balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('insanities')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Check balance (exclusive dev tag is free)
const isFreeForOwner = item.exclusive &&
  (item.exclusive_user_ids ?? []).includes(user.id)
  if (!isFreeForOwner && profile.insanities < item.price) {
    return NextResponse.json({ error: 'Not enough Insanities' }, { status: 400 })
  }

  // Deduct currency and add item using admin client
  const { error: deductError } = await adminClient
    .from('profiles')
    .update({ insanities: profile.insanities - (isFreeForOwner ? 0 : item.price) })
    .eq('id', user.id)

  if (deductError) {
    return NextResponse.json({ error: deductError.message }, { status: 500 })
  }

  const { error: insertError } = await adminClient
    .from('user_items')
    .insert({ user_id: user.id, item_id: itemId })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}