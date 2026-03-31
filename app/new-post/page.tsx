// app/new-post/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import EditorWithPreview from '@/components/EditorWithPreview'
import { hasRequiredRank, Rank } from '@/lib/ranks'

interface Category {
  id: string
  name: string
  slug: string
  required_rank_id: string | null
  ranks: Rank | null
}

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [userRank, setUserRank] = useState<Rank | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user rank
      const { data: profile } = await supabase
        .from('profiles')
        .select('ranks:rank_id(id, name, label, text_color, bg_color, priority)')
        .eq('id', user.id)
        .single()

      const rank = (profile?.ranks as unknown as Rank | null) ?? null
      setUserRank(rank)

      // Get all categories with their required rank
      const { data: cats } = await supabase
        .from('categories')
        .select('*, ranks:required_rank_id(id, name, label, text_color, bg_color, priority)')
        .order('name')

      if (cats) {
        setCategories(cats as unknown as Category[])
        // Default to first category user can post in
        const firstAllowed = cats.find((c) =>
          hasRequiredRank(rank, (c as unknown as Category).ranks)
        )
        setCategoryId(firstAllowed?.id || cats[0]?.id || '')
      }
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const canPostInSelected = hasRequiredRank(userRank, selectedCategory?.ranks ?? null)

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

    // Double-check rank server-side check happens in API
    if (!canPostInSelected) {
      setError('You do not have the required rank to post in this category.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ title, content, category_id: categoryId, user_id: user.id })
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
      <Link href="/" className="text-xs uppercase tracking-widest hover:underline inline-block mb-6" style={{ color: '#888' }}>
        ← Back to posts
      </Link>

      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>New Post</h1>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-xs border px-3 py-2" style={{ color: '#e05565', borderColor: '#e05565' }}>
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#888' }}>Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="Post title"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#888' }}>Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          >
            {categories.map((cat) => {
              const canPost = hasRequiredRank(userRank, cat.ranks)
              return (
                <option key={cat.id} value={cat.id} disabled={!canPost}>
                  {cat.name}{!canPost ? ` (requires ${cat.ranks?.name ?? 'rank'})` : ''}
                </option>
              )
            })}
          </select>
          {/* Warning if selected category is restricted */}
          {!canPostInSelected && selectedCategory && (
            <p className="text-xs mt-1" style={{ color: '#e05565' }}>
              ⚠ You need the <strong>{selectedCategory.ranks?.name}</strong> rank to post here.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#888' }}>Content</label>
          <EditorWithPreview value={content} onChange={setContent} placeholder="Write your post..." />
        </div>

        <button
          type="submit"
          disabled={loading || !content.trim() || !canPostInSelected}
          className="w-full text-xs uppercase tracking-widest border px-4 py-3 cursor-pointer disabled:opacity-50"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  )
}