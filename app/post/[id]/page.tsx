// app/post/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RealtimeCommentSection from '@/components/RealtimeCommentSection'
import Avatar from '@/components/Avatar'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import LocalTime from '@/components/LocalTime'
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
  const isOwner = user?.id === post.user_id

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-xs uppercase tracking-widest hover:underline inline-block mb-6"
        style={{ color: '#888' }}
      >
        ← Back to posts
      </Link>

      <article>
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/category/${post.categories?.slug}`}
            className="text-xs uppercase tracking-widest border px-2 py-0.5 hover:underline"
            style={{ color: '#5ec269', borderColor: '#2a2a2a' }}
          >
            {post.categories?.name}
          </Link>

          {isOwner && (
            <Link
              href={`/edit-post/${post.id}`}
              className="text-xs uppercase tracking-widest hover:underline"
              style={{ color: '#e05565' }}
            >
              Edit
            </Link>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: '#e0e0e0' }}>
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-xs mb-6">
          <Avatar
            url={post.profiles?.avatar_url}
            username={post.profiles?.username}
            size={24}
          />
          <span style={{ color: '#888' }}>
            posted by{' '}
            <Link
              href={`/profile/${post.profiles?.username}`}
              className="hover:underline"
              style={{ color: '#e05565' }}
            >
              {post.profiles?.username}
            </Link>
          </span>
          <span style={{ color: '#2a2a2a' }}>·</span>
          <span style={{ color: '#555' }}>
            <LocalTime timestamp={post.created_at} />
          </span>
          {post.updated_at !== post.created_at && (
            <>
              <span style={{ color: '#2a2a2a' }}>·</span>
              <span style={{ color: '#555' }}>edited</span>
            </>
          )}
        </div>

        <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

        <MarkdownRenderer content={post.content} />
      </article>

      <hr style={{ borderColor: '#2a2a2a' }} className="my-8" />

      <RealtimeCommentSection
        postId={id}
        initialComments={comments || []}
        currentUserId={user?.id}
      />
    </div>
  )
}