// app/new-post/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-200 p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          ✨ Create New Post
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-5 py-4 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
              📝 Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-gray-900 bg-white"
              placeholder="What's on your mind?"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
              📂 Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-gray-900 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-bold text-gray-900 mb-2">
              💭 Content
            </label>
            <textarea
              id="content"
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all text-gray-900 bg-white"
              placeholder="Write your post content..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            {loading ? '⏳ Publishing...' : '🚀 Publish Post'}
          </button>
        </form>
      </div>
    </div>
  )
}