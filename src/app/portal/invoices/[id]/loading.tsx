// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalInvoiceDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-1 h-4 w-36" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="rounded-xl border bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-white p-6 space-y-3">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
