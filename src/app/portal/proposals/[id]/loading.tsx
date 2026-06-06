// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalProposalLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-1 h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-white p-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
      <div className="rounded-xl border bg-white p-6 space-y-3">
        <Skeleton className="h-5 w-20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
