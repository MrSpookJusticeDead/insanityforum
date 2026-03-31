// app/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .eq('is_verified', true)
    .order('username', { ascending: true })

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-xs" style={{ color: '#e05565' }}>
          Failed to load users: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>
        Users
      </h1>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      {(!users || users.length === 0) ? (
        <p className="text-xs" style={{ color: '#555' }}>
          No verified users yet.
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="border px-3 py-2 flex items-center gap-3"
              style={{ borderColor: '#2a2a2a', backgroundColor: '#151515' }}
            >
              <Avatar url={u.avatar_url} username={u.username} size={28} />
              <Link
                href={`/profile/${u.username}`}
                className="text-xs uppercase tracking-widest hover:underline"
                style={{ color: '#e05565' }}
              >
                {u.username}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}