// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#033457] px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-white/10 bg-[#0a4570] p-6">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-7 w-40 bg-white/10" />
          <Skeleton className="mx-auto h-4 w-56 bg-white/10" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12 bg-white/10" />
            <Skeleton className="h-9 w-full bg-white/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-9 w-full bg-white/10" />
          </div>
          <Skeleton className="h-9 w-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
