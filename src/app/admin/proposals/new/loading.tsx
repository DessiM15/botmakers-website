// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function ProposalNewLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-44 bg-white/10" />
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28 bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        ))}
        <Skeleton className="h-10 w-40 bg-white/10" />
      </div>
    </div>
  );
}
