// components/MarkdownRenderer.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'

interface MarkdownRendererProps {
    content: string
}

// Custom audio component
function AudioPlayer({ src, title }: { src: string; title: string }) {
    return (
        <div
            className="my-3 border p-3"
            style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a' }}
        >
            <p className="text-xs mb-2" style={{ color: '#e0a550' }}>
                🎵 {title}
            </p>
            <audio controls className="w-full" style={{ height: '36px' }}>
                <source src={src} />
                Your browser does not support audio.
            </audio>
        </div>
    )
}

// Custom image with error handling
function MarkdownImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  
  // Parse size from alt text: "filename =300x200" or "filename =300"
  const sizeMatch = alt.match(/=(\d+)(?:x(\d+))?$/)
  const cleanAlt = alt.replace(/\s*=\d+(?:x\d+)?$/, '')
  
  let maxWidth = 800 // Default max for posts
  let maxHeight: number | undefined = undefined
  
  if (sizeMatch) {
    maxWidth = parseInt(sizeMatch[1], 10)
    if (sizeMatch[2]) {
      maxHeight = parseInt(sizeMatch[2], 10)
    }
  }
  
  // Enforce max limits
  maxWidth = Math.min(maxWidth, 800)
  if (maxHeight) {
    maxHeight = Math.min(maxHeight, 600)
  }

  if (error) {
    return (
      <span className="text-xs" style={{ color: '#e05565' }}>
        [Image failed to load: {cleanAlt}]
      </span>
    )
  }

  const style: React.CSSProperties = {
    maxWidth: `${maxWidth}px`,
    maxHeight: maxHeight ? `${maxHeight}px` : 'none',
    width: '100%',
    height: 'auto',
    border: '1px solid #2a2a2a',
  }

  return (
    <span className="block my-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={cleanAlt || 'image'}
        onError={() => setError(true)}
        className="max-w-full rounded"
        style={style}
      />
      {sizeMatch && (
        <p className="text-xs mt-1" style={{ color: '#555' }}>
          📐 {maxWidth}{maxHeight ? `×${maxHeight}` : ''} px
        </p>
      )}
    </span>
  )
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    // Pre-process content to handle audio tags: [audio:name](url)
    const processedContent = content.replace(
        /\[audio:([^\]]*)\]\(([^)]+)\)/g,
        '%%%AUDIO|||$1|||$2%%%'
    )

    // Split content by audio markers
    const parts = processedContent.split(/(%%%AUDIO\|\|\|[^%]+%%%)/g)

    return (
        <div className="markdown-content">
            {parts.map((part, index) => {
                // Check if this part is an audio marker
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

                // Render markdown
                return (
                    <ReactMarkdown
                        key={index}
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ children }) => (
                                <h1 className="text-2xl font-bold mt-6 mb-3" style={{ color: '#e0e0e0' }}>
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-xl font-bold mt-5 mb-2" style={{ color: '#e0e0e0' }}>
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-lg font-bold mt-4 mb-2" style={{ color: '#e0e0e0' }}>
                                    {children}
                                </h3>
                            ),
                            h4: ({ children }) => (
                                <h4 className="text-base font-bold mt-3 mb-1" style={{ color: '#e0e0e0' }}>
                                    {children}
                                </h4>
                            ),
                            p: ({ children }) => (
                                <p className="my-2 leading-relaxed" style={{ color: '#ccc' }}>
                                    {children}
                                </p>
                            ),
                            a: ({ href, children }) => (
                                <a
                                    href={href || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                    style={{ color: '#e05565' }}
                                >
                                    {children}
                                </a>
                            ),
                            img: ({ src: imgSrc, alt: imgAlt }) => (
                                <MarkdownImage
                                    src={(imgSrc as string) || ''}
                                    alt={(imgAlt as string) || ''}
                                />
                            ),
                            strong: ({ children }) => (
                                <strong style={{ color: '#e0e0e0' }}>{children}</strong>
                            ),
                            em: ({ children }) => (
                                <em style={{ color: '#ccc' }}>{children}</em>
                            ),
                            del: ({ children }) => (
                                <del style={{ color: '#888' }}>{children}</del>
                            ),
                            code: ({ className, children, ...props }) => {
                                const isBlock = className?.includes('language-')
                                if (isBlock) {
                                    return (
                                        <code
                                            className={`block overflow-x-auto p-3 my-3 text-xs ${className}`}
                                            style={{
                                                backgroundColor: '#1a1a1a',
                                                border: '1px solid #2a2a2a',
                                                color: '#5ec269',
                                                fontFamily: "'Courier New', Courier, monospace",
                                            }}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    )
                                }
                                return (
                                    <code
                                        className="px-1.5 py-0.5 text-xs"
                                        style={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid #2a2a2a',
                                            color: '#e0a550',
                                            fontFamily: "'Courier New', Courier, monospace",
                                        }}
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                )
                            },
                            pre: ({ children }) => (
                                <pre className="my-3 overflow-x-auto">{children}</pre>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote
                                    className="my-3 pl-4"
                                    style={{ borderLeft: '3px solid #e05565', color: '#888' }}
                                >
                                    {children}
                                </blockquote>
                            ),
                            ul: ({ children }) => (
                                <ul className="my-2 pl-6 list-disc" style={{ color: '#ccc' }}>
                                    {children}
                                </ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="my-2 pl-6 list-decimal" style={{ color: '#ccc' }}>
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="my-1">{children}</li>
                            ),
                            hr: () => (
                                <hr className="my-4" style={{ borderColor: '#2a2a2a' }} />
                            ),
                            table: ({ children }) => (
                                <div className="overflow-x-auto my-3">
                                    <table className="w-full text-sm" style={{ borderColor: '#2a2a2a' }}>
                                        {children}
                                    </table>
                                </div>
                            ),
                            th: ({ children }) => (
                                <th
                                    className="px-3 py-2 text-left text-xs uppercase tracking-widest border"
                                    style={{ borderColor: '#2a2a2a', backgroundColor: '#1a1a1a', color: '#e0e0e0' }}
                                >
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => (
                                <td
                                    className="px-3 py-2 border text-sm"
                                    style={{ borderColor: '#2a2a2a', color: '#ccc' }}
                                >
                                    {children}
                                </td>
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