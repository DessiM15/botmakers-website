// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReferralsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-white/10 bg-white/5">
          <CardHeader>
            <div className="h-5 w-40 bg-white/10 rounded animate-pulse mb-1" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="h-12 bg-white/10 rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
