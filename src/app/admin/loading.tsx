// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40 bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <Skeleton className="h-4 w-4 bg-white/10" />
            </div>
            <Skeleton className="h-8 w-16 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
