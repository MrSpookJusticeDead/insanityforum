// app/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createClient()
  const { username } = await params

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      comments (count)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // Get user's comments count
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  // Check if viewing own profile
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="text-xs uppercase tracking-widest hover:underline inline-block mb-6"
        style={{ color: '#888' }}
      >
        ← Back to posts
      </Link>

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
            {profile.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e0e0e0' }}>
              {profile.username}
            </h1>
            <p className="text-xs mt-1" style={{ color: '#888' }}>
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isOwnProfile && (
          <Link
            href="/settings"
            className="text-xs uppercase tracking-widest border px-3 py-1.5 hover:underline"
            style={{ color: '#888', borderColor: '#2a2a2a' }}
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-6">
          <p className="text-sm" style={{ color: '#ccc' }}>
            {profile.bio}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <div className="border px-4 py-2" style={{ borderColor: '#2a2a2a' }}>
          <span className="text-sm font-bold" style={{ color: '#e0e0e0' }}>
            {posts?.length || 0}
          </span>
          <span className="text-xs ml-1" style={{ color: '#888' }}>posts</span>
        </div>
        <div className="border px-4 py-2" style={{ borderColor: '#2a2a2a' }}>
          <span className="text-sm font-bold" style={{ color: '#e0e0e0' }}>
            {commentCount || 0}
          </span>
          <span className="text-xs ml-1" style={{ color: '#888' }}>comments</span>
        </div>
      </div>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      {/* Posts */}
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
        Posts by {profile.username}
      </h2>

      {posts && posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              className="border-b py-4"
              style={{ borderColor: '#2a2a2a' }}
            >
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