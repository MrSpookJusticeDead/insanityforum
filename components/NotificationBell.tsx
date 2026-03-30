// components/NotificationBell.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  message: string
  post_id: string | null
  read: boolean
  created_at: string
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const unreadCount = notifications.filter((n) => !n.read).length

  // Load initial notifications
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (data) setNotifications(data)
    }

    load()
  }, [userId, supabase])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
  }

  const markOneRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_comment': return '💬'
      case 'post_created': return '✍️'
      case 'post_deleted': return '🗑️'
      default: return '🔔'
    }
  }

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative text-base hover:opacity-80 transition-opacity cursor-pointer"
        style={{ color: '#888', lineHeight: 1 }}
        title="Notifications"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 text-xs font-bold rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#e05565',
              color: '#fff',
              minWidth: '16px',
              height: '16px',
              fontSize: '9px',
              lineHeight: 1,
              padding: '0 3px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-7 z-50 border"
          style={{
            backgroundColor: '#151515',
            borderColor: '#2a2a2a',
            width: '320px',
            maxHeight: '420px',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: '#2a2a2a' }}
          >
            <span
              className="text-xs uppercase tracking-widest font-bold"
              style={{ color: '#e0e0e0' }}
            >
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs hover:underline cursor-pointer"
                style={{ color: '#888' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-xs" style={{ color: '#555' }}>
                No notifications yet.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="border-b"
                  style={{
                    borderColor: '#2a2a2a',
                    backgroundColor: notif.read ? 'transparent' : '#1a1a1a',
                  }}
                >
                  {notif.post_id ? (
                    <Link
                      href={`/post/${notif.post_id}`}
                      onClick={() => {
                        markOneRead(notif.id)
                        setOpen(false)
                      }}
                      className="block px-3 py-2 hover:bg-gray-900 transition-colors"
                    >
                      <NotifContent notif={notif} getIcon={getIcon} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => markOneRead(notif.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-900 transition-colors cursor-pointer"
                    >
                      <NotifContent notif={notif} getIcon={getIcon} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotifContent({
  notif,
  getIcon,
}: {
  notif: Notification
  getIcon: (type: string) => string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm flex-shrink-0 mt-0.5">{getIcon(notif.type)}</span>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs leading-relaxed"
          style={{ color: notif.read ? '#888' : '#e0e0e0' }}
        >
          {notif.message}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#555' }}>
          {new Date(notif.created_at).toLocaleString()}
        </p>
      </div>
      {!notif.read && (
        <span
          className="flex-shrink-0 rounded-full mt-1.5"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#e05565',
            display: 'inline-block',
          }}
        />
      )}
    </div>
  )
}