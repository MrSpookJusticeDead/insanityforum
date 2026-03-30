// app/post/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CommentForm from '@/components/CommentForm'
import CommentList from '@/components/CommentList'
import Link from 'next/link'

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { id } = await params

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

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="text-xs uppercase tracking-widest link-hover inline-block mb-6"
        style={{ color: '#888' }}
      >
        ← Back to posts
      </Link>

      {/* Post */}
      <article>
        <div className="mb-4">
          <Link
            href={`/category/${post.categories?.slug}`}
            className="text-xs uppercase tracking-widest border px-2 py-0.5"
            style={{ color: '#5ec269', borderColor: '#2a2a2a' }}
          >
            {post.categories?.name}
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: '#e0e0e0' }}>
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#888' }}>
          <span>
            posted by{' '}
            <span style={{ color: '#e05565' }}>{post.profiles?.username}</span>
          </span>
          <span style={{ color: '#2a2a2a' }}>·</span>
          <span style={{ color: '#555' }}>
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>

        <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

        <div
          className="text-sm whitespace-pre-wrap leading-relaxed"
          style={{ color: '#ccc' }}
        >
          {post.content}
        </div>
      </article>

      {/* Divider */}
      <hr style={{ borderColor: '#2a2a2a' }} className="my-8" />

      {/* Comments Section */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: '#e0e0e0' }}>
          Comments ({comments?.length || 0})
        </h2>

        {user && <CommentForm postId={id} />}

        {!user && (
          <p className="text-xs mb-6" style={{ color: '#888' }}>
            <Link href="/login" className="link-hover" style={{ color: '#e05565' }}>
              Log in
            </Link>{' '}
            to leave a comment.
          </p>
        )}

        <CommentList comments={comments || []} />
      </div>
    </div>
  )
}