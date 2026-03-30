// app/post/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CommentForm from '@/components/CommentForm'
import CommentList from '@/components/CommentList'

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch the post
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username, avatar_url),
      categories:category_id (name, slug)
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Post */}
      <article className="bg-white rounded-lg shadow-sm border p-8">
        <div className="mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {post.categories?.name}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <span>Posted by <strong>{post.profiles?.username}</strong></span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Comments ({comments?.length || 0})
        </h2>

        {user && <CommentForm postId={id} />}

        {!user && (
          <p className="text-gray-500 text-sm mb-4">
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>{' '}
            to leave a comment.
          </p>
        )}

        <CommentList comments={comments || []} />
      </div>
    </div>
  )
}