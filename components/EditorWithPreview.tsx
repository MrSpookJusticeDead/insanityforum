// components/EditorWithPreview.tsx
'use client'

import { useState } from 'react'
import MarkdownEditor from './MarkdownEditor'
import MarkdownRenderer from './MarkdownRenderer'

interface EditorWithPreviewProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function EditorWithPreview({ value, onChange, placeholder }: EditorWithPreviewProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  const tabStyle = (active: boolean) => ({
    color: active ? '#e0e0e0' : '#555',
    borderColor: active ? '#e05565' : '#2a2a2a',
    borderBottomColor: active ? '#0e0e0e' : '#2a2a2a',
  })

  return (
    <div>
      {/* Tabs */}
      <div
        className="flex items-center border-b"
        style={{ borderColor: '#2a2a2a' }}
      >
        <button
          type="button"
          onClick={() => setTab('write')}
          className="px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-colors"
          style={tabStyle(tab === 'write')}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className="px-4 py-2 text-xs uppercase tracking-widest border-b-2 transition-colors"
          style={tabStyle(tab === 'preview')}
        >
          Preview
        </button>
        {tab === 'preview' && !value.trim() && (
          <span className="ml-4 text-xs" style={{ color: '#555' }}>
            Nothing to preview
          </span>
        )}
      </div>

      {/* Content */}
      {tab === 'write' ? (
        <MarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <div
          className="p-4"
          style={{
            backgroundColor: '#0e0e0e',
            border: '1px solid #2a2a2a',
            borderTop: 'none',
            minHeight: '300px',
          }}
        >
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm" style={{ color: '#555' }}>
              Start writing to see a preview...
            </p>
          )}
        </div>
      )}
    </div>
  )
}