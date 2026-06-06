// SPEC: Cross-Cutting > Loading States > skeleton rows
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24 bg-white/10" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64 bg-white/10" />
        <Skeleton className="h-10 w-32 bg-white/10" />
        <Skeleton className="h-10 w-32 bg-white/10" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-white/5" />
        ))}
      </div>
    </div>
  );
}
