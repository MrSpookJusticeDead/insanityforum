// app/api/delete-account/route.ts
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE() {
  // Get the current user via normal server client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Create admin client with service role key — server only, never exposed
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  try {
    // 1. Delete avatar files from storage
    const { data: avatarFiles } = await supabase.storage
      .from('avatars')
      .list(user.id)

    if (avatarFiles && avatarFiles.length > 0) {
      const filesToDelete = avatarFiles.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from('avatars').remove(filesToDelete)
    }

    // 2. Delete post media from storage
    const { data: mediaFiles } = await supabase.storage
      .from('post-media')
      .list(user.id)

    if (mediaFiles && mediaFiles.length > 0) {
      const filesToDelete = mediaFiles.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from('post-media').remove(filesToDelete)
    }

    // 3. Delete comments
    await supabase.from('comments').delete().eq('user_id', user.id)

    // 4. Delete posts
    await supabase.from('posts').delete().eq('user_id', user.id)

    // 5. Delete notifications
    await supabase.from('notifications').delete().eq('user_id', user.id)

    // 6. Delete profile
    await supabase.from('profiles').delete().eq('id', user.id)

    // 7. Delete the auth user — requires service role
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}