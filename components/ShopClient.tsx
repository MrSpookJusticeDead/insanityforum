// components/ShopClient.tsx
'use client'

import { useState } from 'react'
import UserTag from './UserTag'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ShopItem {
    id: string
    name: string
    label: string
    text_color: string
    bg_color: string
    price: number
    exclusive: boolean
    exclusive_user_id: string | null
}

interface ShopClientProps {
    items: ShopItem[]
    profile: {
        insanities: number
        equipped_tag_id: string | null
        last_daily_claim: string | null
    } | null
    ownedItemIds: string[]
    userId?: string
}

export default function ShopClient({ items, profile, ownedItemIds, userId }: ShopClientProps) {
    const [buying, setBuying] = useState<string | null>(null)
    const [equipping, setEquipping] = useState<string | null>(null)
    const [claiming, setClaiming] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [balance, setBalance] = useState(profile?.insanities ?? 0)
    const [equippedId, setEquippedId] = useState(profile?.equipped_tag_id ?? null)
    const [owned, setOwned] = useState<string[]>(ownedItemIds)
    const [lastClaim, setLastClaim] = useState(profile?.last_daily_claim ?? null)
    const router = useRouter()

    const canClaimDaily = () => {
        if (!lastClaim) return true
        const diff = new Date().getTime() - new Date(lastClaim).getTime()
        return diff >= 24 * 60 * 60 * 1000
    }

    const handleDailyClaim = async () => {
        setClaiming(true)
        setError(null)
        setMessage(null)

        const res = await fetch('/api/daily-claim', { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
        } else {
            setBalance((prev) => prev + 100)
            setLastClaim(new Date().toISOString())
            setMessage('+100 Insanities claimed!')
        }
        setClaiming(false)
    }

    const handleBuy = async (item: ShopItem) => {
        setBuying(item.id)
        setError(null)
        setMessage(null)

        const res = await fetch('/api/buy-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id }),
        })
        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
        } else {
            setOwned((prev) => [...prev, item.id])
            setBalance((prev) => prev - item.price)
            setMessage(`You purchased the ${item.name} tag!`)
        }
        setBuying(null)
    }

    const handleEquip = async (itemId: string | null) => {
        setEquipping(itemId ?? 'unequip')
        setError(null)
        setMessage(null)

        const res = await fetch('/api/equip-tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId }),
        })
        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
        } else {
            setEquippedId(itemId)
            setMessage(itemId ? 'Tag equipped!' : 'Tag unequipped!')
            router.refresh()
        }
        setEquipping(null)
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold mb-2" style={{ color: '#e0e0e0' }}>
                Shop
            </h1>

            <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

            {/* Messages */}
            {message && (
                <div className="text-xs border px-3 py-2 mb-4" style={{ color: '#5ec269', borderColor: '#5ec269' }}>
                    {message}
                </div>
            )}
            {error && (
                <div className="text-xs border px-3 py-2 mb-4" style={{ color: '#e05565', borderColor: '#e05565' }}>
                    {error}
                </div>
            )}

            {/* Not logged in */}
            {!userId && (
                <div className="text-xs mb-6" style={{ color: '#888' }}>
                    <Link href="/login" style={{ color: '#e05565' }} className="hover:underline">
                        Log in
                    </Link>{' '}
                    to purchase and equip tags.
                </div>
            )}

            {/* Balance + Daily Claim */}
            {userId && (
                <div
                    className="flex items-center justify-between border px-4 py-3 mb-8"
                    style={{ borderColor: '#2a2a2a', backgroundColor: '#151515' }}
                >
                    <div>
                        <span className="text-xs uppercase tracking-widest" style={{ color: '#888' }}>
                            Balance
                        </span>
                        <p className="text-lg font-bold mt-0.5" style={{ color: '#e0a550' }}>
                            {balance.toLocaleString()} Insanities
                        </p>
                    </div>
                    <button
                        onClick={handleDailyClaim}
                        disabled={claiming || !canClaimDaily()}
                        className="text-xs uppercase tracking-widest border px-4 py-2 cursor-pointer disabled:opacity-40"
                        style={{ color: '#5ec269', borderColor: '#5ec269' }}
                    >
                        {claiming ? 'Claiming...' : canClaimDaily() ? '+ Daily Bonus' : 'Come Back Tomorrow'}
                    </button>
                </div>
            )}

            {/* Currently equipped */}
            {userId && equippedId && (
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#888' }}>
                        Currently Equipped
                    </p>
                    <div className="flex items-center gap-3">
                        {(() => {
                            const tag = items.find((i) => i.id === equippedId)
                            return tag ? (
                                <>
                                    <UserTag label={tag.label} textColor={tag.text_color} bgColor={tag.bg_color} />
                                    <button
                                        onClick={() => handleEquip(null)}
                                        disabled={equipping === 'unequip'}
                                        className="text-xs hover:underline cursor-pointer"
                                        style={{ color: '#888' }}
                                    >
                                        Unequip
                                    </button>
                                </>
                            ) : null
                        })()}
                    </div>
                </div>
            )}

            <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#e0e0e0' }}>
                Available Tags
            </h2>

            {/* Shop grid */}
            <div className="grid grid-cols-1 gap-3">
                {items.map((item) => {
                    const isOwned = owned.includes(item.id)
                    const isEquipped = equippedId === item.id
                    const isExclusiveForMe = item.exclusive && item.exclusive_user_id === userId
                    const isExclusiveForOther = item.exclusive && item.exclusive_user_id !== userId
                    const canAfford = balance >= item.price
                    const isFree = item.price === 0

                    return (
                        <div
                            key={item.id}
                            className="border px-4 py-3 flex items-center justify-between gap-4"
                            style={{
                                borderColor: isEquipped ? '#e0a550' : '#2a2a2a',
                                backgroundColor: '#151515',
                            }}
                        >
                            {/* Left: preview + info */}
                            <div className="flex items-center gap-4">
                                <UserTag
                                    label={item.label}
                                    textColor={item.text_color}
                                    bgColor={item.bg_color}
                                />
                                <div>
                                    <p className="text-sm font-bold" style={{ color: '#e0e0e0' }}>
                                        {item.name}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: '#e0a550' }}>
                                        {isExclusiveForMe
                                            ? 'Exclusive — yours for free'
                                            : isExclusiveForOther
                                                ? 'Exclusive — not available'
                                                : isFree
                                                    ? 'Free'
                                                    : `${item.price.toLocaleString()} Insanities`}
                                    </p>
                                </div>
                            </div>

                            {/* Right: action */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {!userId ? null : isEquipped ? (
                                    <span className="text-xs" style={{ color: '#e0a550' }}>
                                        ✓ Equipped
                                    </span>
                                ) : isOwned ? (
                                    <button
                                        onClick={() => handleEquip(item.id)}
                                        disabled={equipping === item.id}
                                        className="text-xs uppercase tracking-widest border px-3 py-1 cursor-pointer disabled:opacity-50"
                                        style={{ color: '#e0a550', borderColor: '#e0a550' }}
                                    >
                                        {equipping === item.id ? '...' : 'Equip'}
                                    </button>
                                ) : isExclusiveForOther ? (
                                    <span className="text-xs" style={{ color: '#555' }}>
                                        Locked
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleBuy(item)}
                                        disabled={buying === item.id || (!canAfford && !isExclusiveForMe)}
                                        className="text-xs uppercase tracking-widest border px-3 py-1 cursor-pointer disabled:opacity-40"
                                        style={{ color: '#5ec269', borderColor: '#5ec269' }}
                                    >
                                        {buying === item.id ? '...' : isExclusiveForMe ? 'Claim Free' : 'Buy'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}