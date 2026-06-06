// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Card, CardContent } from "@/components/ui/card";

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-36 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
