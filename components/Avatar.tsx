// components/Avatar.tsx
import Image from 'next/image'

interface AvatarProps {
  url: string | null
  username: string | null
  size?: number
  className?: string
}

export default function Avatar({ url, username, size = 40, className = '' }: AvatarProps) {
  const src = url || '/default-avatar.png'
  const initials = username?.charAt(0).toUpperCase() || '?'

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
        onError={(e) => {
          // If image fails to load, hide it (the background color shows)
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
    </div>
  )
}