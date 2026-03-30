// components/CommentEditor.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'

interface CommentEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function CommentEditor({ value, onChange, placeholder }: CommentEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const wrapSelection = (before: string, after: string, placeholder: string = 'text') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder

    const newValue =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end)

    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const newValue = value.substring(0, start) + text + value.substring(start)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + text.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true)
    setUploadError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUploadError('You must be logged in')
        setUploading(false)
        return null
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File must be less than 10MB')
        setUploading(false)
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setUploadError(uploadError.message)
        setUploading(false)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath)

      setUploading(false)
      return publicUrl
    } catch {
      setUploadError('Upload failed')
      setUploading(false)
      return null
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, GIF, and WebP are allowed')
      return
    }

    const url = await uploadFile(file)
    if (url) {
      insertAtCursor(`\n![${file.name} =300](${url})\n`)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only MP3, WAV, OGG, M4A, and WebM are allowed')
      return
    }

    const url = await uploadFile(file)
    if (url) {
      insertAtCursor(`\n[audio:${file.name}](${url})\n`)
    }

    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  const btnStyle = {
    color: '#888',
    borderColor: '#2a2a2a',
  }

  return (
    <div>
      {/* Toolbar — simple, comment-focused */}
      <div
        className="flex flex-wrap items-center gap-1 p-2 border-b"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {/* Text formatting */}
        <button
          type="button"
          onClick={() => wrapSelection('**', '**', 'bold')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors font-bold"
          style={btnStyle}
          title="Bold"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => wrapSelection('*', '*', 'italic')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors italic"
          style={btnStyle}
          title="Italic"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => wrapSelection('~~', '~~', 'strikethrough')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors line-through"
          style={btnStyle}
          title="Strikethrough"
        >
          S
        </button>

        <button
          type="button"
          onClick={() => wrapSelection('`', '`', 'code')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors font-mono"
          style={btnStyle}
          title="Inline Code"
        >
          {'<>'}
        </button>

        <span className="mx-1" style={{ color: '#2a2a2a' }}>|</span>

        {/* Link */}
        <button
          type="button"
          onClick={() => wrapSelection('[', '](url)', 'link text')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Link"
        >
          Link
        </button>

        <span className="mx-1" style={{ color: '#2a2a2a' }}>|</span>

        {/* Image upload */}
        <label
          className="px-2 py-1 text-xs border cursor-pointer hover:bg-gray-800 transition-colors"
          style={{
            color: uploading ? '#555' : '#5ec269',
            borderColor: uploading ? '#2a2a2a' : '#5ec269',
          }}
          title="Upload Image/GIF"
        >
          {uploading ? '...' : 'Image'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {/* Image from URL */}
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter image URL:')
            if (url) {
              const size = prompt(
                'Enter image size (e.g., 200x150 or just 200).\nLeave empty for default (max 500px).',
                '400'
              )
              if (size !== null) {
                const altText = size.trim() ? `image =${size.trim()}` : 'image'
                insertAtCursor(`\n![${altText}](${url})\n`)
              }
            }
          }}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Image from URL"
        >
          ImgURL
        </button>

        {/* Audio upload */}
        <label
          className="px-2 py-1 text-xs border cursor-pointer hover:bg-gray-800 transition-colors"
          style={{
            color: uploading ? '#555' : '#e0a550',
            borderColor: uploading ? '#2a2a2a' : '#e0a550',
          }}
          title="Upload Audio"
        >
          {uploading ? '...' : 'Audio'}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm"
            onChange={handleAudioUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div
          className="text-xs px-2 py-1"
          style={{ backgroundColor: '#1a1a1a', color: '#e05565' }}
        >
          {uploadError}
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write a comment... (**bold**, *italic*, [link](url))'}
        rows={4}
        className="w-full px-3 py-3 text-sm resize-y"
        style={{
          backgroundColor: '#0e0e0e',
          border: '1px solid #2a2a2a',
          borderTop: 'none',
          color: '#e0e0e0',
          fontFamily: "'Courier New', Courier, monospace",
          minHeight: '100px',
        }}
      />

      {/* Help text */}
      <p className="text-xs mt-1" style={{ color: '#555' }}>
        **bold** &nbsp;·&nbsp; *italic* &nbsp;·&nbsp; ~~strikethrough~~ &nbsp;·&nbsp; `code` &nbsp;·&nbsp; [link](url) &nbsp;·&nbsp; ![image](url)
      </p>
    </div>
  )
}