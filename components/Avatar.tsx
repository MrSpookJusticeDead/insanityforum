// components/Avatar.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
  url: string | null
  username: string | null
  size?: number
  className?: string
}

export default function Avatar({ url, username, size = 40, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const src = (!imgError && url) ? url : '/default-avatar.png'

  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        border: '1px solid #2a2a2a',
        backgroundColor: '#1a1a1a',
      }}
    >
      <Image
        src={src}
        alt={username || 'Avatar'}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        unoptimized
        onError={() => setImgError(true)}
      />
    </div>
  )
}