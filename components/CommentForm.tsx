// components/CommentForm.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('comments').insert({
      content,
      post_id: postId,
      user_id: user.id,
    })

    if (!error) {
      setContent('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        rows={3}
        required
        className="w-full px-3 py-2 text-sm"
        style={{
          backgroundColor: '#0e0e0e',
          border: '1px solid #2a2a2a',
          color: '#e0e0e0',
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 text-xs uppercase tracking-widest border px-4 py-2 transition-colors cursor-pointer disabled:opacity-50"
        style={{
          color: '#e05565',
          borderColor: '#e05565',
        }}
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}