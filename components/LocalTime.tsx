// components/LocalTime.tsx
'use client'

interface LocalTimeProps {
  timestamp: string
  showTime?: boolean
}

export default function LocalTime({ timestamp, showTime = true }: LocalTimeProps) {
  return (
    <span>
      {showTime
        ? new Date(timestamp).toLocaleString()
        : new Date(timestamp).toLocaleDateString()
      }
    </span>
  )
}