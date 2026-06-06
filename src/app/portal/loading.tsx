// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalDashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-4 w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}
