// lib/developer.ts

// Your Supabase user ID — find it in Supabase → Authentication → Users
export const DEVELOPER_ID = '75a8a154-2b68-42b4-afdc-11456e52bd32'

export function isDeveloper(userId: string | undefined | null): boolean {
  return userId === DEVELOPER_ID
}