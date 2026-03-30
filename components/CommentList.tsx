// components/CommentList.tsx
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
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-6 h-6 flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#e05565',
              }}
            >
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-xs font-bold" style={{ color: '#e05565' }}>
              {comment.profiles?.username || 'Unknown'}
            </span>
            <span className="text-xs" style={{ color: '#555' }}>
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p
            className="text-sm whitespace-pre-wrap pl-9"
            style={{ color: '#ccc' }}
          >
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  )
}