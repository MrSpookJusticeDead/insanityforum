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
  const supabase = createClient()

  // Insert text at cursor position
  const insertAtCursor = (before: string, after: string = '', placeholder: string = '') => {
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

    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  // Wrap selected text
  const wrapSelection = (before: string, after: string, placeholder: string = 'text') => {
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
      insertAtCursor(before, after, placeholder)
    }
  }

  // Upload file to Supabase Storage
  const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string | null> => {
    setUploading(true)
    setUploadError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUploadError('You must be logged in')
        setUploading(false)
        return null
      }

      // Validate file size (10MB max)
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
    } catch (err) {
      setUploadError('Upload failed')
      setUploading(false)
      return null
    }
  }

  // Handle image/gif upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only JPG, PNG, GIF, and WebP are allowed')
      return
    }

    const url = await uploadFile(file, 'image')
    if (url) {
      insertAtCursor(`\n![${file.name}](${url})\n`, '', '')
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handle audio upload
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only MP3, WAV, OGG, M4A, and WebM audio are allowed')
      return
    }

    const url = await uploadFile(file, 'audio')
    if (url) {
      insertAtCursor(`\n[audio:${file.name}](${url})\n`, '', '')
    }

    // Reset input
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  // Toolbar button style
  const btnStyle = {
    color: '#888',
    borderColor: '#2a2a2a',
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 p-2 border-b"
        style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        {/* Headings */}
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

        {/* Code block */}
        <button
          type="button"
          onClick={() => insertAtCursor('\n```\n', '\n```\n', 'code here')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Code Block"
        >
          Code
        </button>

        {/* Quote */}
        <button
          type="button"
          onClick={() => insertAtCursor('\n> ', '\n', 'quote')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Quote"
        >
          Quote
        </button>

        {/* List */}
        <button
          type="button"
          onClick={() => insertAtCursor('\n- ', '\n', 'item')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Bullet List"
        >
          List
        </button>

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

        {/* Divider */}
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

        {/* Image upload */}
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

        {/* Image URL */}
        <button
          type="button"
          onClick={() => insertAtCursor('\n![alt text](', ')\n', 'image-url')}
          className="px-2 py-1 text-xs border hover:bg-gray-800 transition-colors"
          style={btnStyle}
          title="Image from URL"
        >
          ImgURL
        </button>

        {/* Audio upload */}
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

      {/* Help text */}
      <div className="flex items-center gap-4 mt-2">
        <span className="text-xs" style={{ color: '#555' }}>
          Markdown supported: **bold** *italic* # heading [link](url) ![image](url)
        </span>
      </div>
    </div>
  )
}