export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#14110e] border border-[#2e261d] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gold/10 before:to-transparent ${className}`}
    />
  )
}

export function QuestBoardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between pb-1">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Skeleton Filter Row */}
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-24" />
      </div>

      {/* Skeleton Quest Cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-[#2e261d] bg-[#14110e] p-4"
        >
          <div className="flex items-center gap-3.5 flex-1">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-2 flex-1 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      ))}
    </div>
  )
}
