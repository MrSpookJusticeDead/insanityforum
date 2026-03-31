// app/loading.tsx  (home page)
export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Categories skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-3 w-20 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 w-20 rounded" style={{ backgroundColor: '#2a2a2a' }} />
          ))}
        </div>
      </div>

      <hr style={{ borderColor: '#2a2a2a' }} className="mb-8" />
      <div className="h-6 w-32 rounded mb-6" style={{ backgroundColor: '#2a2a2a' }} />

      {/* Posts skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="mb-6 pb-6 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="h-5 w-64 rounded mb-2" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="h-3 w-full rounded mb-1" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="h-3 w-32 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        </div>
      ))}
    </div>
  )
}