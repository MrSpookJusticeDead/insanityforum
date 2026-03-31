// app/profile/[username]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import DeveloperTag from '@/components/DeveloperTag'
import OnlineStatus from '@/components/OnlineStatus'
import { isDeveloper } from '@/lib/developer'

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const supabase = await createClient()
  const { username } = await params

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  // No profile or not verified → 404
  if (!profile || !profile.is_verified) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      categories:category_id (name, slug),
      comments (count)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id
  const dev = isDeveloper(profile.id)

  return (
    <div className="max-w-3xl mx-auto">
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
          <Avatar
            url={profile.avatar_url}
            username={profile.username}
            size={64}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold" style={{ color: '#e0e0e0' }}>
                {profile.username}
              </h1>
              {dev && <DeveloperTag />}
            </div>
            <OnlineStatus
              profileId={profile.id}
              initialLastSeen={profile.last_seen ?? null}
            />
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

      {profile.bio && (
        <div className="mb-6">
          <p className="text-sm" style={{ color: '#ccc' }}>
            {profile.bio}
          </p>
        </div>
      )}

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