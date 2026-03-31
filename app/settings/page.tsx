// app/settings/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AvatarUpload from '@/components/AvatarUpload'
import BackButton from '@/components/BackButton'

type OwnedTag = {
  item_id: string
  shop_items: {
    id: string
    name: string
    label: string
    text_color: string
    bg_color: string
  }
}

export default function SettingsPage() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  const [ownedTags, setOwnedTags] = useState<OwnedTag[]>([])

  const [equippedTagId, setEquippedTagId] = useState<string | null>(null)
  const [tagLoading, setTagLoading] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient() // back to normal


  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: tags } = await supabase
        .from('user_items')
        .select('item_id, shop_items(id, name, label, text_color, bg_color)')
        .eq('user_id', user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('equipped_tag_id')
        .eq('id', user.id)
        .single()


      if (profile) {
        setUsername(profile.username || '')
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url || null)
      }
      setPageLoading(false)

      if (tags) setOwnedTags(tags as unknown as OwnedTag[])

      if (profileData) setEquippedTagId(profileData.equipped_tag_id)
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEquipTag = async (itemId: string | null) => {
    setTagLoading(itemId ?? 'unequip')
    const res = await fetch('/api/equip-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    if (res.ok) {
      setEquippedTagId(itemId)
      setMessage(itemId ? 'Tag equipped!' : 'Tag unequipped!')
      router.refresh()
    }
    setTagLoading(null)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
      })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Profile updated successfully')
      router.refresh()
    }
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to delete account')
        setLoading(false)
        return
      }

      // Sign out locally after server deleted the auth user
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <p className="text-sm" style={{ color: '#888' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back link */}
      <BackButton fallbackHref="/profile" fallbackLabel="Back" />
      
      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        Account Settings
      </h1>

      {/* Messages */}
      {message && (
        <div
          className="text-xs border px-3 py-2 mb-6"
          style={{ color: '#5ec269', borderColor: '#5ec269' }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          className="text-xs border px-3 py-2 mb-6"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {error}
        </div>
      )}

      {/* ===== AVATAR SECTION ===== */}
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
        Avatar
      </h2>

      <div className="mb-8">
        <AvatarUpload
          currentUrl={avatarUrl}
          userId={userId}
          username={username}
        />
      </div>

      {/* ===== PROFILE SECTION ===== */}
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
        Profile
      </h2>

      <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm"
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="text-xs uppercase tracking-widest border px-4 py-2 cursor-pointer disabled:opacity-50"
          style={{ color: '#5ec269', borderColor: '#5ec269' }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* ===== PASSWORD SECTION ===== */}
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
        Change Password
      </h2>

      <form onSubmit={handleChangePassword} className="space-y-4 mb-8">
        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div>
          <label
            className="block text-xs uppercase tracking-widest mb-2"
            style={{ color: '#888' }}
          >
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="text-xs uppercase tracking-widest border px-4 py-2 cursor-pointer disabled:opacity-50"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {/* ===== TAG SECTION ===== */}
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
        Equipped Tag
      </h2>

      {ownedTags.length === 0 ? (
        <p className="text-xs mb-8" style={{ color: '#555' }}>
          You don&apos;t own any tags yet.{' '}
          <Link href="/shop" style={{ color: '#e05565' }} className="hover:underline">
            Visit the shop
          </Link>
        </p>
      ) : (
        <div className="space-y-2 mb-8">
          <button
            onClick={() => handleEquipTag(null)}
            disabled={!equippedTagId || tagLoading === 'unequip'}
            className="w-full text-left border px-3 py-2 text-xs cursor-pointer disabled:opacity-40"
            style={{ borderColor: '#2a2a2a', color: '#888' }}
          >
            None (unequip)
            {!equippedTagId && (
              <span className="ml-2" style={{ color: '#e0a550' }}>✓</span>
            )}
          </button>
          {ownedTags.map((t) => {
            const tag = t.shop_items
            const isEquipped = equippedTagId === t.item_id
            return (
              <button
                key={t.item_id}
                onClick={() => handleEquipTag(t.item_id)}
                disabled={isEquipped || tagLoading === t.item_id}
                className="w-full text-left border px-3 py-2 flex items-center gap-3 cursor-pointer disabled:opacity-60"
                style={{
                  borderColor: isEquipped ? '#e0a550' : '#2a2a2a',
                  backgroundColor: isEquipped ? '#1a1500' : 'transparent',
                }}
              >
                <span
                  className="font-bold uppercase"
                  style={{
                    backgroundColor: tag.bg_color,
                    color: tag.text_color,
                    fontSize: '9px',
                    padding: '2px 6px',
                    letterSpacing: '1.5px',
                  }}
                >
                  {tag.label}
                </span>
                <span className="text-xs" style={{ color: '#e0e0e0' }}>{tag.name}</span>
                {isEquipped && (
                  <span className="ml-auto text-xs" style={{ color: '#e0a550' }}>✓ Equipped</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ===== DANGER ZONE ===== */}
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e05565' }}>
        Danger Zone
      </h2>

      {!deleteConfirm ? (
        <button
          onClick={() => setDeleteConfirm(true)}
          className="text-xs uppercase tracking-widest border px-4 py-2 cursor-pointer"
          style={{ color: '#e05565', borderColor: '#e05565' }}
        >
          Delete Account
        </button>
      ) : (
        <div
          className="border p-4 space-y-3"
          style={{ borderColor: '#e05565' }}
        >
          <p className="text-xs" style={{ color: '#e05565' }}>
            This action is irreversible. All your posts, comments, and data will be deleted.
          </p>
          <p className="text-xs" style={{ color: '#888' }}>
            Type <strong style={{ color: '#e05565' }}>DELETE</strong> to confirm:
          </p>
          <input
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            className="w-full px-3 py-2 text-sm"
            placeholder="Type DELETE"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteText !== 'DELETE' || loading}
              className="text-xs uppercase tracking-widest border px-4 py-2 cursor-pointer disabled:opacity-30"
              style={{ color: '#e05565', borderColor: '#e05565' }}
            >
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              onClick={() => {
                setDeleteConfirm(false)
                setDeleteText('')
              }}
              className="text-xs uppercase tracking-widest hover:underline cursor-pointer"
              style={{ color: '#888' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}