// components/RealtimeCommentSection.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import CommentForm from './CommentForm'
import CommentEditor from './CommentEditor'
import CommentRenderer from './CommentRenderer'
import Avatar from './Avatar'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at?: string
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      // Also listen for UPDATE and DELETE
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const updated = payload.new as Comment
          setComments((prev) =>
            prev.map((c) =>
              c.id === updated.id ? { ...c, content: updated.content, updated_at: updated.updated_at } : c
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const deleted = payload.old as Comment
          setComments((prev) => prev.filter((c) => c.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
    setError(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditContent('')
    setError(null)
  }

  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim()) return
    setEditLoading(true)
    setError(null)

    const res = await fetch('/api/edit-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, content: editContent }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, content: editContent, updated_at: new Date().toISOString() }
            : c
        )
      )
      setEditingId(null)
      setEditContent('')
    }

    setEditLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    setDeleteLoading(commentId)
    setError(null)

    const res = await fetch('/api/delete-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      // Optimistic update
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    }

    setDeleteLoading(null)
  }

  return (
    <div>
      <h2
        className="text-sm font-bold uppercase tracking-widest mb-6"
        style={{ color: '#e0e0e0' }}
      >
        Comments ({comments.length})
      </h2>

      {error && (
        <div
          className="text-xs border px-3 py-2 mb-4"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {error}
        </div>
      )}

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
          <Link href="/login" className="hover:underline" style={{ color: '#e05565' }}>
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
            const isOwner = currentUserId === comment.user_id
            const isEditing = editingId === comment.id

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

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
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
                    {/*  Show edited indicator */}
                    {comment.updated_at && comment.updated_at !== comment.created_at && (
                      <span className="text-xs" style={{ color: '#555' }}>
                        · edited
                      </span>
                    )}
                  </div>

                  {/*  Edit / Delete buttons for comment owner */}
                  {isOwner && !isEditing && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditStart(comment)}
                        className="text-xs hover:underline"
                        style={{ color: '#888' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteLoading === comment.id}
                        className="text-xs hover:underline disabled:opacity-50"
                        style={{ color: '#e05565' }}
                      >
                        {deleteLoading === comment.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Content or Edit form */}
                {isEditing ? (
                  <div className="pl-9">
                    <CommentEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="Edit your comment..."
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleEditSave(comment.id)}
                        disabled={editLoading || !editContent.trim()}
                        className="text-xs uppercase tracking-widest border px-3 py-1 cursor-pointer disabled:opacity-50"
                        style={{ color: '#5ec269', borderColor: '#5ec269' }}
                      >
                        {editLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleEditCancel}
                        disabled={editLoading}
                        className="text-xs hover:underline"
                        style={{ color: '#888' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pl-9">
                    <CommentRenderer content={comment.content} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}