// components/RealtimePostList.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string } | null
  categories: { name: string; slug: string } | null
  comment_count: number
}

interface RealtimePostListProps {
  initialPosts: Post[]
  currentUserId?: string
}

export default function RealtimePostList({ initialPosts, currentUserId }: RealtimePostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          const newPost = payload.new as {
            id: string
            title: string
            content: string
            created_at: string
            user_id: string
            category_id: string
          }

          // Fetch the related profile and category
          const [{ data: profile }, { data: category }] = await Promise.all([
            supabase
              .from('profiles')
              .select('username')
              .eq('id', newPost.user_id)
              .single(),
            supabase
              .from('categories')
              .select('name, slug')
              .eq('id', newPost.category_id)
              .single(),
          ])

          const fullPost: Post = {
            id: newPost.id,
            title: newPost.title,
            content: newPost.content,
            created_at: newPost.created_at,
            user_id: newPost.user_id,
            profiles: profile,
            categories: category,
            comment_count: 0,
          }

          setPosts((prev) => [fullPost, ...prev])
          setNewPostIds((prev) => new Set(prev).add(newPost.id))

          // Remove highlight after 4 seconds
          setTimeout(() => {
            setNewPostIds((prev) => {
              const next = new Set(prev)
              next.delete(newPost.id)
              return next
            })
          }, 4000)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          setPosts((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Listen for comment count changes
  useEffect(() => {
    const channel = supabase
      .channel('comments-count-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          const newComment = payload.new as { post_id: string }
          setPosts((prev) =>
            prev.map((p) =>
              p.id === newComment.post_id
                ? { ...p, comment_count: p.comment_count + 1 }
                : p
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (posts.length === 0) {
    return (
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
    )
  }

  return (
    <div>
      {posts.map((post) => {
        const isOwner = currentUserId === post.user_id
        const isNew = newPostIds.has(post.id)

        return (
          <div
            key={post.id}
            className="border-b py-5 transition-colors duration-1000"
            style={{
              borderColor: '#2a2a2a',
              backgroundColor: isNew ? '#1a1a0a' : 'transparent',
            }}
          >
            {isNew && (
              <span
                className="text-xs uppercase tracking-widest mb-1 inline-block"
                style={{ color: '#5ec269' }}
              >
                ● New
              </span>
            )}
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
                    <Link
                      href={`/profile/${post.profiles?.username}`}
                      className="hover:underline"
                      style={{ color: '#e05565' }}
                    >
                      {post.profiles?.username || 'Unknown'}
                    </Link>
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
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs border px-2 py-1"
                  style={{ color: '#888', borderColor: '#2a2a2a' }}
                >
                  {post.comment_count} replies
                </span>
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
            </div>
          </div>
        )
      })}
    </div>
  )
}