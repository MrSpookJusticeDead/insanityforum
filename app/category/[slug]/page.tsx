// app/category/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username),
      comments (count)
    `)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Back link */}
      <Link
        href="/"
        className="text-xs uppercase tracking-widest link-hover inline-block mb-6"
        style={{ color: '#888' }}
      >
        ← Back to posts
      </Link>

      <h1 className="text-xl font-bold mb-1" style={{ color: '#e0e0e0' }}>
        {category.name}
      </h1>
      <p className="text-sm mb-6" style={{ color: '#888' }}>
        {category.description}
      </p>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <div>
        {posts?.map((post) => (
          <div
            key={post.id}
            className="border-b py-5"
            style={{ borderColor: '#2a2a2a' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/post/${post.id}`}
                  className="font-bold transition-colors hover:underline"
                  style={{ color: '#e0e0e0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e05565')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#e0e0e0')}
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-sm line-clamp-1" style={{ color: '#888' }}>
                  {post.content}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs" style={{ color: '#888' }}>
                    by <span style={{ color: '#e05565' }}>{post.profiles?.username}</span>
                  </span>
                  <span style={{ color: '#2a2a2a' }}>·</span>
                  <span className="text-xs" style={{ color: '#555' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span
                className="text-xs border px-2 py-1 flex-shrink-0"
                style={{ color: '#888', borderColor: '#2a2a2a' }}
              >
                {post.comments?.[0]?.count || 0} replies
              </span>
            </div>
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-sm py-8" style={{ color: '#555' }}>
            No posts in this category yet.
          </p>
        )}
      </div>
    </div>
  )
}