import { Skeleton } from "@/components/ui/skeleton";

export default function LeadDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 bg-white/10" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40 w-full bg-white/5" />
          <Skeleton className="h-32 w-full bg-white/5" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full bg-white/5" />
          <Skeleton className="h-32 w-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
