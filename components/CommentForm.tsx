// components/CommentForm.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import CommentEditor from './CommentEditor'
import CommentRenderer from './CommentRenderer'

export default function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
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
      setTab('write')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div
        className="flex items-center border-b mb-0"
        style={{ borderColor: '#2a2a2a' }}
      >
        <button
          type="button"
          onClick={() => setTab('write')}
          className="px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-colors"
          style={{
            color: tab === 'write' ? '#e0e0e0' : '#555',
            borderBottomColor: tab === 'write' ? '#e05565' : 'transparent',
          }}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className="px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-colors"
          style={{
            color: tab === 'preview' ? '#e0e0e0' : '#555',
            borderBottomColor: tab === 'preview' ? '#e05565' : 'transparent',
          }}
        >
          Preview
        </button>
      </div>

      {tab === 'write' ? (
        <CommentEditor
          value={content}
          onChange={setContent}
          placeholder="Write a comment..."
        />
      ) : (
        <div
          className="p-3 min-h-24"
          style={{
            backgroundColor: '#0e0e0e',
            border: '1px solid #2a2a2a',
          }}
        >
          {content.trim() ? (
            <CommentRenderer content={content} />
          ) : (
            <p className="text-xs" style={{ color: '#555' }}>
              Nothing to preview...
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-2 text-xs uppercase tracking-widest border px-4 py-2 cursor-pointer disabled:opacity-50 transition-colors"
        style={{ color: '#e05565', borderColor: '#e05565' }}
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}