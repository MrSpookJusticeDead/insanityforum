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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            🔥 Recent Posts
          </h1>

          {posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-md border border-purple-100 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/post/${post.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                      <p className="text-gray-700 mt-2 text-sm line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center flex-wrap gap-3 mt-4 text-xs">
                        <span className="flex items-center space-x-1">
                          <span className="text-gray-500">by</span>
                          <strong className="text-purple-700">{post.profiles?.username || 'Unknown'}</strong>
                        </span>
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                          {post.categories?.name}
                        </span>
                        <span className="text-gray-500">
                          📅 {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                          💬 {post.comments?.[0]?.count || 0} replies
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-700 text-lg font-medium mb-4">No posts yet. Be the first to post!</p>
              <Link
                href="/new-post"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:shadow-xl hover:scale-105 transition-all font-bold"
              >
                ✨ Create First Post
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-6 sticky top-20">
          <h2 className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            📂 Categories
          </h2>
          <ul className="space-y-2">
            {categories?.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="block px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800 font-medium transition-all hover:shadow-md hover:scale-105 text-sm"
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