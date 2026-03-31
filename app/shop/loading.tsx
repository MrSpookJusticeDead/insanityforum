// app/shop/loading.tsx
export default function ShopLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-6 w-16 rounded mb-2" style={{ backgroundColor: '#2a2a2a' }} />
      <hr style={{ borderColor: '#2a2a2a' }} className="mb-6" />

      {/* Balance bar skeleton */}
      <div className="border px-4 py-3 mb-8 flex justify-between" style={{ borderColor: '#2a2a2a', backgroundColor: '#151515' }}>
        <div className="h-8 w-40 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="h-8 w-32 rounded" style={{ backgroundColor: '#2a2a2a' }} />
      </div>

      {/* Items skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border px-4 py-3 mb-3 flex justify-between" style={{ borderColor: '#2a2a2a', backgroundColor: '#151515' }}>
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 rounded" style={{ backgroundColor: '#2a2a2a' }} />
            <div>
              <div className="h-4 w-24 rounded mb-1" style={{ backgroundColor: '#2a2a2a' }} />
              <div className="h-3 w-20 rounded" style={{ backgroundColor: '#2a2a2a' }} />
            </div>
          </div>
          <div className="h-7 w-16 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        </div>
      ))}
    </div>
  )
}