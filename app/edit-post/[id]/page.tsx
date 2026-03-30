// app/edit-post/[id]/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [postLoading, setPostLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Unwrap params
      const { id } = await params

      // Load categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (cats) setCategories(cats)

      // Load post
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !post) {
        setError('Post not found')
        setPostLoading(false)
        return
      }

      // Check ownership
      if (post.user_id !== user.id) {
        setError('You can only edit your own posts')
        setPostLoading(false)
        return
      }

      setTitle(post.title)
      setContent(post.content)
      setCategoryId(post.category_id)
      setPostLoading(false)
    }
    loadData()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { id } = await params

    const { error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        category_id: categoryId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/post/${id}`)
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return
    }

    setLoading(true)
    const { id } = await params

    // Delete comments first
    await supabase
      .from('comments')
      .delete()
      .eq('post_id', id)

    // Delete post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  if (postLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-sm" style={{ color: '#888' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="text-xs uppercase tracking-widest hover:underline inline-block mb-6"
        style={{ color: '#888' }}
      >
        ← Back to posts
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#e0e0e0' }}>
          Edit Post
        </h1>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs uppercase tracking-widest border px-3 py-1.5 cursor-pointer disabled:opacity-50"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          Delete Post
        </button>
      </div>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      {error && (
        <div
          className="text-xs border px-3 py-2 mb-6"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Content
          </label>
          <textarea
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-xs uppercase tracking-widest border px-4 py-3 cursor-pointer disabled:opacity-50"
          style={{ color: '#5ec269', borderColor: '#5ec269' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}