// components/AvatarUpload.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  currentUrl: string | null
  userId: string
  username: string | null
}

export default function AvatarUpload({ currentUrl, userId, username }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const supabase = createClient()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, GIF, and WebP images are allowed')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create file path: userId/avatar.ext
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${fileExt}`

      // Delete old avatar if exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId)

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`)
        await supabase.storage.from('avatars').remove(filesToDelete)
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Add timestamp to bust cache
      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setPreview(avatarUrl)
        router.refresh()
      }
    } catch (err) {
      setError('Failed to upload image')
    }

    setUploading(false)
  }

  const handleRemove = async () => {
    setUploading(true)
    setError(null)

    try {
      // Delete files from storage
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId)

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`)
        await supabase.storage.from('avatars').remove(filesToDelete)
      }

      // Set avatar_url to null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setPreview(null)
        router.refresh()
      }
    } catch (err) {
      setError('Failed to remove image')
    }

    setUploading(false)
  }

  return (
    <div>
      <label
        className="block text-xs uppercase tracking-widest mb-3"
        style={{ color: '#888' }}
      >
        Profile Picture
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            width: 80,
            height: 80,
            border: '1px solid #2a2a2a',
            backgroundColor: '#1a1a1a',
          }}
        >
          <Image
            src={preview || '/default-avatar.png'}
            alt={username || 'Avatar'}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs uppercase tracking-widest border px-3 py-1.5 cursor-pointer inline-block text-center"
            style={{
              color: '#5ec269',
              borderColor: '#5ec269',
              opacity: uploading ? 0.5 : 1,
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {preview && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="text-xs uppercase tracking-widest border px-3 py-1.5 cursor-pointer disabled:opacity-50"
              style={{ color: '#e05565', borderColor: '#e05565' }}
            >
              Remove
            </button>
          )}

          <p className="text-xs" style={{ color: '#555' }}>
            JPG, PNG, GIF, WebP. Max 2MB.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="text-xs border px-3 py-2 mt-3"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}