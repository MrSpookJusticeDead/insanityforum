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

  // Fetch category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  // Fetch posts in this category
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
      <p className="text-gray-600 mb-6">{category.description}</p>

      <div className="space-y-4">
        {posts?.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
            <Link
              href={`/post/${post.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {post.title}
            </Link>
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">{post.content}</p>
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              <span>by <strong>{post.profiles?.username}</strong></span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>💬 {post.comments?.[0]?.count || 0} replies</span>
            </div>
          </div>
        ))}
        {(!posts || posts.length === 0) && (
          <p className="text-gray-500">No posts in this category yet.</p>
        )}
      </div>
    </div>
  )
}