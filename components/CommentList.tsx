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
    return <p className="text-gray-500 text-sm">No comments yet.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {comment.profiles?.username || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}