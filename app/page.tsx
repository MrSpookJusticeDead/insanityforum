// app/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch recent posts with author and category info
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h1>

        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/post/${post.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span>
                        by <strong>{post.profiles?.username || 'Unknown'}</strong>
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {post.categories?.name}
                      </span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        💬 {post.comments?.[0]?.count || 0} replies
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
            <Link
              href="/new-post"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Create Post
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-bold text-gray-900 mb-4">Categories</h2>
          <ul className="space-y-2">
            {categories?.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}