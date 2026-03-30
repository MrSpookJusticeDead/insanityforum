// app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username),
      categories:category_id (name, slug),
      comments (count)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div>
      {/* Categories row */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs uppercase tracking-widest" style={{ color: '#888' }}>
          Categories:
        </span>
        <div className="flex items-center gap-3">
          {categories?.map((category, index) => (
            <span key={category.id} className="flex items-center gap-3">
              <Link
                href={`/category/${category.slug}`}
                className="text-xs uppercase tracking-widest hover:underline"
                style={{ color: '#e05565' }}
              >
                {category.name}
              </Link>
              {index < (categories?.length || 0) - 1 && (
                <span style={{ color: '#2a2a2a' }}>/</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-8" />

      {/* Section title */}
      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        Recent Posts
      </h1>

      {/* Posts */}
      {posts && posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              className="border-b py-5"
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
                  <p
                    className="mt-1 text-sm line-clamp-1"
                    style={{ color: '#888' }}
                  >
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs" style={{ color: '#888' }}>
                      by{' '}
                      <span style={{ color: '#e05565' }}>
                        {post.profiles?.username || 'Unknown'}
                      </span>
                    </span>
                    <span style={{ color: '#2a2a2a' }}>·</span>
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
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className="text-xs border px-2 py-1"
                    style={{ color: '#888', borderColor: '#2a2a2a' }}
                  >
                    {post.comments?.[0]?.count || 0} replies
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-16 border"
          style={{ borderColor: '#2a2a2a' }}
        >
          <p className="text-sm mb-4" style={{ color: '#888' }}>
            No posts yet. Be the first to post!
          </p>
          <Link
            href="/new-post"
            className="text-xs uppercase tracking-widest border px-4 py-2 inline-block"
            style={{ color: '#e05565', borderColor: '#e05565' }}
          >
            Create Post
          </Link>
        </div>
      )}
    </div>
  )
}