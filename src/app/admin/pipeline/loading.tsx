// SPEC: Cross-Cutting > Loading States > skeleton columns
import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32 bg-white/10" />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="min-w-[260px] space-y-3">
            <Skeleton className="h-6 w-full bg-white/10" />
            <Skeleton className="h-24 w-full bg-white/5" />
            <Skeleton className="h-24 w-full bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
