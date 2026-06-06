import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded bg-white/10" />
        <Skeleton className="h-8 w-32 bg-white/10" />
      </div>

      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded bg-white/10" />
          <Skeleton className="h-6 w-40 bg-white/10" />
          <Skeleton className="h-8 w-8 rounded bg-white/10" />
        </div>
        <Skeleton className="h-8 w-48 bg-white/10" />
      </div>

      {/* Grid skeleton */}
      <Card className="border-white/10 bg-white/5 overflow-hidden">
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h${i}`} className="h-8 bg-white/10" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/[0.03]" />
          ))}
        </div>
      </Card>
    </div>
  );
}
