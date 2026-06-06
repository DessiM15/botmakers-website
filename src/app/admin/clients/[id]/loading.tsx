import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 bg-white/10" />
      <Skeleton className="h-10 w-80 bg-white/10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-60 w-full bg-white/5" />
        <Skeleton className="h-60 w-full bg-white/5" />
      </div>
    </div>
  );
}
