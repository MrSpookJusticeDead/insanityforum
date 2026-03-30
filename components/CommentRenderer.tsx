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

  if (error) {
    return (
      <span className="text-xs" style={{ color: '#e05565' }}>
        [Image failed to load]
      </span>
    )
  }

  return (
    <span className="block my-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || 'image'}
        onError={() => setError(true)}
        className="max-w-full"
        style={{
          maxHeight: '400px',
          border: '1px solid #2a2a2a',
        }}
      />
    </span>
  )
}

function AudioPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div
      className="my-2 border p-2"
      style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
    >
      <p className="text-xs mb-1" style={{ color: '#e0a550' }}>
        🎵 {title}
      </p>
      <audio controls className="w-full" style={{ height: '32px' }}>
        <source src={src} />
        Your browser does not support audio.
      </audio>
    </div>
  )
}

export default function CommentRenderer({ content }: CommentRendererProps) {
  // Handle audio tags
  const processedContent = content.replace(
    /\[audio:([^\]]*)\]\(([^)]+)\)/g,
    '%%%AUDIO|||$1|||$2%%%'
  )

  const parts = processedContent.split(/(%%%AUDIO\|\|\|[^%]+%%%)/g)

  return (
    <div className="comment-content text-sm" style={{ color: '#ccc' }}>
      {parts.map((part, index) => {
        const audioMatch = part.match(/%%%AUDIO\|\|\|(.+?)\|\|\|(.+?)%%%/)
        if (audioMatch) {
          return (
            <AudioPlayer
              key={index}
              title={audioMatch[1]}
              src={audioMatch[2]}
            />
          )
        }

        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={{
              // NO headings — just render as bold paragraph
              h1: ({ children }) => (
                <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>
                  {children}
                </p>
              ),
              h2: ({ children }) => (
                <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>
                  {children}
                </p>
              ),
              h3: ({ children }) => (
                <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>
                  {children}
                </p>
              ),
              h4: ({ children }) => (
                <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>
                  {children}
                </p>
              ),
              h5: ({ children }) => (
                <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>
                  {children}
                </p>
              ),
              h6: ({ children }) => (
                <p className="font-bold my-1" style={{ color: '#e0e0e0' }}>
                  {children}
                </p>
              ),

              // Paragraph
              p: ({ children }) => (
                <p className="my-1 leading-relaxed" style={{ color: '#ccc' }}>
                  {children}
                </p>
              ),

              // Bold
              strong: ({ children }) => (
                <strong style={{ color: '#e0e0e0' }}>{children}</strong>
              ),

              // Italic
              em: ({ children }) => (
                <em style={{ color: '#ccc' }}>{children}</em>
              ),

              // Strikethrough
              del: ({ children }) => (
                <del style={{ color: '#888' }}>{children}</del>
              ),

              // Inline code
              code: ({ children }) => (
                <code
                  className="px-1 py-0.5 text-xs"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e0a550',
                    fontFamily: "'Courier New', Courier, monospace",
                  }}
                >
                  {children}
                </code>
              ),

              // No code blocks in comments — render as inline
              pre: ({ children }) => (
                <span
                  className="block px-2 py-1 my-1 text-xs overflow-x-auto"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    color: '#e0a550',
                    fontFamily: "'Courier New', Courier, monospace",
                  }}
                >
                  {children}
                </span>
              ),

              // Links
              a: ({ href, children }) => (
                <a
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline break-all"
                  style={{ color: '#e05565' }}
                >
                  {children}
                </a>
              ),

              // Images
              img: ({ src: imgSrc, alt: imgAlt }) => (
                <CommentImage
                  src={(imgSrc as string) || ''}
                  alt={(imgAlt as string) || ''}
                />
              ),

              // No blockquotes — keep it simple
              blockquote: ({ children }) => (
                <span
                  className="block pl-3 my-1 italic"
                  style={{
                    borderLeft: '2px solid #2a2a2a',
                    color: '#888',
                  }}
                >
                  {children}
                </span>
              ),

              // Lists — keep them
              ul: ({ children }) => (
                <ul className="my-1 pl-4 list-disc" style={{ color: '#ccc' }}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="my-1 pl-4 list-decimal" style={{ color: '#ccc' }}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="my-0.5">{children}</li>
              ),

              // No tables in comments
              table: ({ children }) => (
                <span className="text-xs" style={{ color: '#555' }}>
                  {children}
                </span>
              ),

              // No horizontal rule
              hr: () => (
                <span className="block border-t my-2" style={{ borderColor: '#2a2a2a' }} />
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}