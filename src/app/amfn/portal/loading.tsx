import { Skeleton } from "@/components/ui/skeleton";

export default function AmfnPortalLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-[#0f1729]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
            <Skeleton className="h-5 w-40 bg-white/10" />
          </div>
          <Skeleton className="h-8 w-20 bg-white/10" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-2 mb-8">
          <Skeleton className="h-9 w-56 bg-white/10" />
          <Skeleton className="h-5 w-full max-w-xl bg-white/10" />
        </div>

        {/* Category skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-10">
            <Skeleton className="h-6 w-48 bg-white/10 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: i === 0 ? 3 : 2 }).map((_, j) => (
                <Skeleton key={j} className="h-48 rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
