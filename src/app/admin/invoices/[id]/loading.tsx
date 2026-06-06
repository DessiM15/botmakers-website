// SPEC: CLAUDE.md > Every page: skeleton loading state
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function InvoiceDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-white/10 bg-white/5">
              <CardHeader>
                <div className="h-5 w-28 bg-white/10 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-white/10 rounded animate-pulse" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full bg-white/10 rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
