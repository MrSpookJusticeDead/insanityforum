// components/CommentRenderer.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'

interface CommentRendererProps {
  content: string
}

function CommentImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  const sizeMatch = alt.match(/=(\d+)(?:x(\d+))?$/)
  const cleanAlt = alt.replace(/\s*=\d+(?:x\d+)?$/, '')
  let maxWidth = 250
  let maxHeight: number | undefined = undefined
  if (sizeMatch) {
    maxWidth = parseInt(sizeMatch[1], 10)
    if (sizeMatch[2]) maxHeight = parseInt(sizeMatch[2], 10)
  }
  maxWidth = Math.min(maxWidth, 350)
  if (maxHeight) maxHeight = Math.min(maxHeight, 300)

  if (error) return <span className="text-xs" style={{ color: '#e05565' }}>[Image failed to load]</span>

  return (
    <span className="block my-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={cleanAlt || 'image'} onError={() => setError(true)} className="max-w-full"
        style={{ maxWidth: `${maxWidth}px`, maxHeight: maxHeight ? `${maxHeight}px` : 'none', width: '100%', height: 'auto', border: '1px solid #2a2a2a' }} />
    </span>
  )
}

function AudioPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="my-2 border p-2" style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}>
      <p className="text-xs mb-1" style={{ color: '#e0a550' }}>🎵 {title}</p>
      <audio controls className="w-full md:w-3/5" style={{ height: '37px' }}>
        <source src={src} />
        Your browser does not support audio.
      </audio>
    </div>
  )
}

function VideoPlayer({ src, title }: { src: string; title: string }) {
  // Parse "center" keyword
  const centered = /\bcenter\b/.test(title)
  // Parse size: =500 or =500x300
  const sizeMatch = title.match(/=(\d+)(?:x(\d+))?/)
  const cleanTitle = title
    .replace(/\s*=\d+(?:x\d+)?/, '')
    .replace(/\s*\bcenter\b/, '')
    .trim()

  let width = 500
  let maxHeight: number | undefined = undefined

  if (sizeMatch) {
    width = parseInt(sizeMatch[1], 10)
    if (sizeMatch[2]) maxHeight = parseInt(sizeMatch[2], 10)
  }

  // Enforce comment limits
  width = Math.min(width, 500)
  if (maxHeight) maxHeight = Math.min(maxHeight, 400)

  return (
    <span
      style={{
        display: 'block',
        margin: '8px 0',
        textAlign: centered ? ('center' as const) : ('left' as const),
      }}
    >
      <span
        style={{
          display: 'inline-block',
          border: '1px solid #2a2a2a',
          backgroundColor: '#1a1a1a',
          padding: '8px',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: '11px',
            color: '#a78bfa',
            marginBottom: '6px',
          }}
        >
          🎬 {cleanTitle}
        </span>
        <video
          controls
          style={{
            display: 'block',
            width: `${width}px`,
            maxWidth: '100%',
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          }}
        >
          <source src={src} />
          Your browser does not support video.
        </video>
      </span>
    </span>
  )
}

export default function CommentRenderer({ content }: CommentRendererProps) {
  const processedContent = content
    .replace(/\[audio:([^\]]*)\]\(([^)]+)\)/g, '%%%AUDIO|||$1|||$2%%%')
    .replace(/\[video:([^\]]*)\]\(([^)]+)\)/g, '%%%VIDEO|||$1|||$2%%%')

  const parts = processedContent.split(/(%%%(?:AUDIO|VIDEO)\|\|\|[^%]+%%%)/g)

  return (
    <div className="comment-content text-sm" style={{ color: '#ccc' }}>
      {parts.map((part, index) => {
        const audioMatch = part.match(/%%%AUDIO\|\|\|(.+?)\|\|\|(.+?)%%%/)
        if (audioMatch) {
          return <AudioPlayer key={index} title={audioMatch[1]} src={audioMatch[2]} />
        }

        const videoMatch = part.match(/%%%VIDEO\|\|\|(.+?)\|\|\|(.+?)%%%/)
        if (videoMatch) {
          return <VideoPlayer key={index} title={videoMatch[1]} src={videoMatch[2]} />
        }

        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>{children}</p>,
              h2: ({ children }) => <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>{children}</p>,
              h3: ({ children }) => <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>{children}</p>,
              h4: ({ children }) => <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>{children}</p>,
              h5: ({ children }) => <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>{children}</p>,
              h6: ({ children }) => <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>{children}</p>,
              p: ({ children }) => <p className="my-1 leading-relaxed" style={{ color: '#ccc' }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: '#e0e0e0' }}>{children}</strong>,
              em: ({ children }) => <em style={{ color: '#ccc' }}>{children}</em>,
              del: ({ children }) => <del style={{ color: '#888' }}>{children}</del>,
              code: ({ children }) => (
                <code className="px-1 py-0.5 text-xs"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0a550', fontFamily: "'Courier New', Courier, monospace" }}>
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <span className="block px-2 py-1 my-1 text-xs overflow-x-auto"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e0a550', fontFamily: "'Courier New', Courier, monospace" }}>
                  {children}
                </span>
              ),
              a: ({ href, children }) => (
                <a href={href || '#'} target="_blank" rel="noopener noreferrer"
                  className="hover:underline break-all" style={{ color: '#e05565' }}>
                  {children}
                </a>
              ),
              img: ({ src: imgSrc, alt: imgAlt }) => (
                <CommentImage src={(imgSrc as string) || ''} alt={(imgAlt as string) || ''} />
              ),
              blockquote: ({ children }) => (
                <span className="block pl-3 my-1 italic" style={{ borderLeft: '2px solid #2a2a2a', color: '#888' }}>
                  {children}
                </span>
              ),
              ul: ({ children }) => <ul className="my-1 pl-4 list-disc" style={{ color: '#ccc' }}>{children}</ul>,
              ol: ({ children }) => <ol className="my-1 pl-4 list-decimal" style={{ color: '#ccc' }}>{children}</ol>,
              li: ({ children }) => <li className="my-0.5">{children}</li>,
              table: ({ children }) => <span className="text-xs" style={{ color: '#555' }}>{children}</span>,
              hr: () => <span className="block border-t my-2" style={{ borderColor: '#2a2a2a' }} />,
            }}
          >
            {part}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}