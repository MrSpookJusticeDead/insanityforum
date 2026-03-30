// app/profile/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      comments (count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get user's comments count
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center text-2xl font-bold"
            style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#e05565',
            }}
          >
            {profile?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e0e0e0' }}>
              {profile?.username || 'Unknown'}
            </h1>
            <p className="text-xs" style={{ color: '#555' }}>
              {user.email}
            </p>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-xs uppercase tracking-widest border px-3 py-1.5 hover:underline"
          style={{ color: '#888', borderColor: '#2a2a2a' }}
        >
          Edit Profile
        </Link>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="mb-6">
          <p className="text-sm" style={{ color: '#ccc' }}>
            {profile.bio}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <div
          className="border px-4 py-2"
          style={{ borderColor: '#2a2a2a' }}
        >
          <span className="text-sm font-bold" style={{ color: '#e0e0e0' }}>
            {posts?.length || 0}
          </span>
          <span className="text-xs ml-1" style={{ color: '#888' }}>posts</span>
        </div>
        <div
          className="border px-4 py-2"
          style={{ borderColor: '#2a2a2a' }}
        >
          <span className="text-sm font-bold" style={{ color: '#e0e0e0' }}>
            {commentCount || 0}
          </span>
          <span className="text-xs ml-1" style={{ color: '#888' }}>comments</span>
        </div>
      </div>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      {/* User's Posts */}
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
        Posts
      </h2>

      {posts && posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              className="border-b py-4"
              style={{ borderColor: '#2a2a2a' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/post/${post.id}`}
                    className="font-bold hover:underline"
                    style={{ color: '#e0e0e0' }}
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-sm line-clamp-1" style={{ color: '#888' }}>
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="text-xs border px-2 py-0.5"
                      style={{ color: '#5ec269', borderColor: '#2a2a2a' }}
                    >
                      {post.categories?.name}
                    </span>
                    <span style={{ color: '#2a2a2a' }}>·</span>
                    <span className="text-xs" style={{ color: '#555' }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ color: '#2a2a2a' }}>·</span>
                    <span className="text-xs" style={{ color: '#888' }}>
                      {post.comments?.[0]?.count || 0} replies
                    </span>
                    <span style={{ color: '#2a2a2a' }}>·</span>
                    <Link
                      href={`/edit-post/${post.id}`}
                      className="text-xs uppercase tracking-widest hover:underline"
                      style={{ color: '#e05565' }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm py-4" style={{ color: '#555' }}>
          No posts yet.
        </p>
      )}
    </div>
  )
}