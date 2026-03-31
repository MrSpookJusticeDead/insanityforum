// app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RealtimePostList from '@/components/RealtimePostList'

export default async function HomePage() {
  const supabase = await createClient()

  // Run both queries at the same time ✅
  const [
    { data: { user } },
    { data: categories },
    { data: postsRaw }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username),
        categories:category_id (name, slug),
        comments (count)
      `)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const posts = (postsRaw || []).map((p) => ({
    ...p,
    comment_count: p.comments?.[0]?.count || 0,
  }))

  return (
    <div>
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

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-8" />

      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        Recent Posts
      </h1>

      <RealtimePostList initialPosts={posts} currentUserId={user?.id} />
    </div>
  )
}

export const revalidate = 30