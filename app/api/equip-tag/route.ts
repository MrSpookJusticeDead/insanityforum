// app/api/equip-tag/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { itemId } = await request.json() // null to unequip

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // If equipping, verify ownership
  if (itemId) {
    const { data: owned } = await supabase
      .from('user_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single()

    if (!owned) {
      return NextResponse.json({ error: 'You do not own this item' }, { status: 403 })
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ equipped_tag_id: itemId ?? null })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}