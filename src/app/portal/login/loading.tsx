// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-36" />
          <Skeleton className="mx-auto h-4 w-60" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
