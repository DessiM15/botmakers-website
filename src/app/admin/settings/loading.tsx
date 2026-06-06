// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-32 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/10 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
