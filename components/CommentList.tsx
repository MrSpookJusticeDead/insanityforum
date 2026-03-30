// components/CommentList.tsx
import Avatar from './Avatar'
import CommentRenderer from './CommentRenderer'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
  } | null
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-xs" style={{ color: '#555' }}>
        No comments yet.
      </p>
    )
  }

  return (
    <div>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border-b py-4"
          style={{ borderColor: '#2a2a2a' }}
        >
          {/* Comment header */}
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

          {/* Comment content — rendered markdown */}
          <div className="pl-9">
            <CommentRenderer content={comment.content} />
          </div>
        </div>
      ))}
    </div>
  )
}