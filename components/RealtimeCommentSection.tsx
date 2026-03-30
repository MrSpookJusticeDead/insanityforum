// components/RealtimeCommentSection.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import CommentForm from './CommentForm'
import Avatar from './Avatar'
import CommentRenderer from './CommentRenderer'
import Link from 'next/link'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    post_id: string
    profiles: {
        username: string
        avatar_url: string | null
    } | null
}

interface RealtimeCommentSectionProps {
    postId: string
    initialComments: Comment[]
    currentUserId?: string
}

export default function RealtimeCommentSection({
    postId,
    initialComments,
    currentUserId,
}: RealtimeCommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set())
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('comments-realtime-' + postId)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${postId}`,
                },
                async (payload) => {
                    const newComment = payload.new as Comment

                    // Skip if it's from the current user (CommentForm already handles optimistic UI via router.refresh — we avoid duplication)
                    // Fetch the profile for the commenter
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', newComment.user_id)
                        .single()

                    const fullComment: Comment = {
                        ...newComment,
                        profiles: profile,
                    }

                    setComments((prev) => {
                        // Avoid duplicates
                        if (prev.some((c) => c.id === fullComment.id)) return prev
                        return [...prev, fullComment]
                    })

                    setNewCommentIds((prev) => new Set(prev).add(newComment.id))

                    setTimeout(() => {
                        setNewCommentIds((prev) => {
                            const next = new Set(prev)
                            next.delete(newComment.id)
                            return next
                        })
                    }, 4000)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [postId, supabase])

    return (
        <div>
            <h2
                className="text-sm font-bold uppercase tracking-widest mb-6"
                style={{ color: '#e0e0e0' }}
            >
                Comments ({comments.length})
            </h2>

            {currentUserId ? (
                <CommentForm
                    postId={postId}
                    onCommentPosted={(comment) => {
                        setComments((prev) => {
                            if (prev.some((c) => c.id === comment.id)) return prev
                            return [...prev, comment]
                        })
                    }}
                />
            ) : (
                <p className="text-xs mb-6" style={{ color: '#888' }}>
                    <Link
                        href="/login"
                        className="hover:underline"
                        style={{ color: '#e05565' }}
                    >
                        Log in
                    </Link>{' '}
                    to leave a comment.
                </p>
            )}

            {comments.length === 0 ? (
                <p className="text-xs" style={{ color: '#555' }}>
                    No comments yet.
                </p>
            ) : (
                <div>
                    {comments.map((comment) => {
                        const isNew = newCommentIds.has(comment.id)
                        return (
                            <div
                                key={comment.id}
                                className="border-b py-4 transition-colors duration-1000"
                                style={{
                                    borderColor: '#2a2a2a',
                                    backgroundColor: isNew ? '#0e1a0e' : 'transparent',
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
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar
                                        url={comment.profiles?.avatar_url || null}
                                        username={comment.profiles?.username || null}
                                        size={24}
                                    />
                                    <Link
                                        href={`/profile/${comment.profiles?.username}`}
                                        className="text-xs font-bold hover:underline"
                                        style={{ color: '#e05565' }}
                                    >
                                        {comment.profiles?.username || 'Unknown'}
                                    </Link>
                                    <span className="text-xs" style={{ color: '#555' }}>
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="pl-9">
                                    <CommentRenderer content={comment.content} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}