// app/new-post/page.tsx
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

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (data) {
        setCategories(data)
        setCategoryId(data[0]?.id || '')
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to create a post')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        category_id: categoryId,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/post/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="text-xs uppercase tracking-widest link-hover inline-block mb-6"
        style={{ color: '#888' }}
      >
        ← Back to posts
      </Link>

      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        New Post
      </h1>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="text-xs border px-3 py-2"
            style={{ color: '#e05565', borderColor: '#e05565' }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="Post title"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Category
          </label>
          <select
            id="category"
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
            htmlFor="content"
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Content
          </label>
          <textarea
            id="content"
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="Write your post..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-xs uppercase tracking-widest border px-4 py-3 transition-colors cursor-pointer disabled:opacity-50"
          style={{
            color: '#e05565',
            borderColor: '#e05565',
          }}
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  )
}