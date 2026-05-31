/** Skeleton de tarjeta de categoría */
export function SkeletonCard() {
  return (
    <div className="cat-card p-4 pointer-events-none" style={{ minHeight: 130 }}>
      <div className="skeleton w-11 h-11 rounded-xl mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  )
}

/** Skeleton de sección de área */
export function SkeletonArea() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-5 w-8 rounded-full" />
      </div>
      <div className="area-divider mb-4" />
      <div className="cat-grid">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
