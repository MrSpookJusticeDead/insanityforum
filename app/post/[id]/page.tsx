// app/post/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RealtimeCommentSection from '@/components/RealtimeCommentSection'
import Avatar from '@/components/Avatar'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import LocalTime from '@/components/LocalTime'
import Link from 'next/link'
import BackButton from '@/components/BackButton'
import RankTag from '@/components/RankTag'
import UserTag from '@/components/UserTag'

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
      profiles:user_id (
        username,
        avatar_url,
        equipped_tag_id,
        ranks:rank_id (label, text_color, bg_color),
        shop_items!profiles_equipped_tag_id_fkey (label, text_color, bg_color)
      ),
      categories:category_id (name, slug)
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  const [{ data: comments }, { data: { user } }] = await Promise.all([
    supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url,
          equipped_tag_id,
          ranks:rank_id (label, text_color, bg_color),
          shop_items!profiles_equipped_tag_id_fkey (label, text_color, bg_color)
        )
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ])

  const isOwner = user?.id === post.user_id

  // Extract post author tags
  const postRank = post.profiles?.ranks as { label: string; text_color: string; bg_color: string } | null
  const postUserTag = post.profiles?.shop_items as { label: string; text_color: string; bg_color: string } | null

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton fallbackHref="/" fallbackLabel="Back" />

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

        <div className="flex items-center gap-2 text-xs mb-6 flex-wrap">
          <Avatar
            url={post.profiles?.avatar_url}
            username={post.profiles?.username}
            size={24}
          />
          <span style={{ color: '#888' }}>posted by</span>
          <Link
            href={`/profile/${post.profiles?.username}`}
            className="hover:underline font-bold"
            style={{ color: '#e05565' }}
          >
            {post.profiles?.username}
          </Link>

          {/* ✅ Rank Tag */}
          {postRank && (
            <RankTag
              label={postRank.label}
              textColor={postRank.text_color}
              bgColor={postRank.bg_color}
            />
          )}

          {/* ✅ User Tag (equipped shop item) */}
          {postUserTag && (
            <UserTag
              label={postUserTag.label}
              textColor={postUserTag.text_color}
              bgColor={postUserTag.bg_color}
            />
          )}

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