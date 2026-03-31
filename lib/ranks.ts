// lib/ranks.ts

export interface Rank {
  id: string
  name: string
  label: string
  text_color: string
  bg_color: string
  priority: number
}

// Check if a user's rank meets the required rank
export function hasRequiredRank(
  userRank: Rank | null,
  requiredRank: Rank | null
): boolean {
  if (!requiredRank) return true // no restriction
  if (!userRank) return false // user has no rank
  return userRank.priority >= requiredRank.priority
}