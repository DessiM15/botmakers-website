// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Card, CardContent } from "@/components/ui/card";

export default function ProposalsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
        <div className="h-9 w-36 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-white/5">
            <CardContent className="p-4 space-y-2">
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-10 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <div className="h-5 w-60 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
