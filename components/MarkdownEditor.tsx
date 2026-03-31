// components/MarkdownEditor.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const insertAtCursor = (before: string, after: string = '', insertPlaceholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || insertPlaceholder

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

  const wrapSelection = (before: string, after: string, wrapPlaceholder: string = 'text') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (selectedText) {
      const newValue =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end)
      onChange(newValue)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        )
      }, 0)
    } else {
      insertAtCursor(before, after, wrapPlaceholder)
    }
  }

  // Upload file to Supabase Storage (removed unused 'type' parameter)
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

      if (file.size > 20 * 1024 * 1024) {
        setUploadError('File must be less than 20MB')
        setUploading(false)
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadErr } = await supabase.storage
        .from('post-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadErr) {
        setUploadError(uploadErr.message)
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

  // For uploaded images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, GIF, and WebP are allowed')
      return
    }
    const url = await uploadFile(file)
    // ✅ Auto-insert at max post image size (200px), no prompt
    if (url) insertAtCursor(`\n![${file.name} =200](${url})\n`, '', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only MP3, WAV, OGG, M4A, and WebM audio are allowed')
      return
    }

    const url = await uploadFile(file)
    if (url) {
      insertAtCursor(`\n[audio:${file.name}](${url})\n`, '', '')
    }

    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only MP4, WebM, OGG, and MOV are allowed')
      return
    }
    const url = await uploadFile(file)
    // ✅ Auto-insert at max post size (800px), no prompt
    if (url) insertAtCursor(`\n[video:${file.name} =800](${url})\n`, '', '')
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const btnStyle = {
    color: '#888',
    borderColor: '#2a2a2a',
  }

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-1 p-2 border-b"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <button
          type="button"
          onClick={() => insertAtCursor('\n# ', '\n', 'Heading')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n## ', '\n', 'Heading')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n### ', '\n', 'Heading')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Heading 3"
        >
          H3
        </button>

        <span className="mx-1" style={{ color: '#2a2a2a' }}>|</span>

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

        <button
          type="button"
          onClick={() => insertAtCursor('\n```\n', '\n```\n', 'code here')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Code Block"
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n> ', '\n', 'quote')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Quote"
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor('\n- ', '\n', 'item')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Bullet List"
        >
          List
        </button>
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

        <button
          type="button"
          onClick={() => insertAtCursor('\n---\n', '', '')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Horizontal Rule"
        >
          ―
        </button>

        <span className="mx-1" style={{ color: '#2a2a2a' }}>|</span>

        <label
          className="px-2 py-1 text-xs border cursor-pointer hover:bg-gray-800 transition-colors"
          style={{ ...btnStyle, color: '#5ec269', borderColor: '#5ec269' }}
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

        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter image URL:')
            if (url) {
              const size = prompt(
                'Enter image size (e.g., 300x200 or just 300).\nLeave empty for full size (max 200px).',
                '200'
              )
              if (size !== null) {
                const altText = size.trim() ? `image =${size.trim()}` : 'image'
                insertAtCursor(`\n![${altText}](${url})\n`, '', '')
              }
            }
          }}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Image from URL"
        >
          ImgURL
        </button>

        {/*  Video upload  */}
        <label
          className="px-2 py-1 text-xs border cursor-pointer hover:bg-gray-800 transition-colors"
          style={{ ...btnStyle, color: uploading ? '#555' : '#a78bfa', borderColor: uploading ? '#2a2a2a' : '#a78bfa' }}
          title="Upload Video"
        >
          {uploading ? '...' : 'Video'}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <label
          className="px-2 py-1 text-xs border cursor-pointer hover:bg-gray-800 transition-colors"
          style={{ ...btnStyle, color: '#e0a550', borderColor: '#e0a550' }}
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

      {uploadError && (
        <div
          className="text-xs px-2 py-1"
          style={{ backgroundColor: '#1a1a1a', color: '#e05565' }}
        >
          {uploadError}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your post... (Markdown supported)'}
        rows={14}
        className="w-full px-3 py-3 text-sm resize-y"
        style={{
          backgroundColor: '#0e0e0e',
          border: '1px solid #2a2a2a',
          borderTop: 'none',
          color: '#e0e0e0',
          fontFamily: "'Courier New', Courier, monospace",
          minHeight: '200px',
        }}
      />

      <div className="flex items-center gap-4 mt-2">
        <span className="text-xs" style={{ color: '#555' }}>
          Markdown supported: **bold** *italic* # heading [link](url) ![image](url =size)
        </span>
      </div>
    </div>
  )
}