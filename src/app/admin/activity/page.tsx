// SPEC: SPEC-PAGES > /admin/activity — paginated activity log with filters
// DEP-MAP: Activity > UI
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, FolderOpen, FileText, Receipt, MessageSquare, Clock, Settings,
} from "lucide-react";
import {
  getActivityLog,
  getDistinctActions,
  getDistinctEntityTypes,
} from "@/lib/db/queries/activity";
import { getTeamMembers } from "@/lib/actions/settings";
import { ActivityFilters } from "@/components/admin/activity-filters";

function getIcon(action: string) {
  if (action.startsWith("lead")) return <Users className="h-3.5 w-3.5" />;
  if (action.startsWith("project") || action.startsWith("milestone")) return <FolderOpen className="h-3.5 w-3.5" />;
  if (action.startsWith("proposal")) return <FileText className="h-3.5 w-3.5" />;
  if (action.startsWith("invoice") || action.startsWith("payment")) return <Receipt className="h-3.5 w-3.5" />;
  if (action.startsWith("question")) return <MessageSquare className="h-3.5 w-3.5" />;
  if (action.startsWith("setting") || action.startsWith("team")) return <Settings className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

function getEntityLink(entityType: string, entityId: string): string | null {
  const routes: Record<string, string> = {
    lead: `/admin/leads/${entityId}`,
    project: `/admin/projects/${entityId}`,
    proposal: `/admin/proposals/${entityId}`,
    invoice: `/admin/invoices/${entityId}`,
  };
  return routes[entityType] ?? null;
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    actorId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function ActivityLogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const [result, actions, entityTypes, members] = await Promise.all([
    getActivityLog(
      {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      },
      page
    ),
    getDistinctActions(),
    getDistinctEntityTypes(),
    getTeamMembers(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Activity Log</h1>

      <ActivityFilters
        actions={actions}
        entityTypes={entityTypes}
        members={members.map((m) => ({ id: m.id, fullName: m.fullName }))}
        currentFilters={params}
      />

      {result.entries.length === 0 ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-400">No activity found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {result.entries.map(({ entry, actorName }) => {
                const link = getEntityLink(entry.entityType, entry.entityId);
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-4 hover:bg-white/5 transition">
                    <div className="mt-0.5 text-[#03FF00] flex-shrink-0">
                      {getIcon(entry.action)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {actorName && (
                          <span className="text-sm font-medium">{actorName}</span>
                        )}
                        {!actorName && entry.actorType === "system" && (
                          <Badge className="bg-gray-500/20 text-gray-400 text-xs">system</Badge>
                        )}
                        {!actorName && entry.actorType === "client" && (
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">client</Badge>
                        )}
                        <span className="text-sm text-gray-300">
                          {entry.action.replace(/[._]/g, " ")}
                        </span>
                        {link && (
                          <Link href={link} className="text-xs text-[#03FF00] hover:underline">
                            view
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.createdAt).toLocaleString()}
                        <span className="ml-2 text-gray-600">{entry.entityType}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/activity?page=${page - 1}${params.actorId ? `&actorId=${params.actorId}` : ""}${params.action ? `&action=${params.action}` : ""}${params.entityType ? `&entityType=${params.entityType}` : ""}`}
              className="px-3 py-1.5 text-sm border border-white/10 rounded hover:bg-white/5 text-gray-400"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-gray-400">
            Page {result.page} of {result.totalPages}
          </span>
          {page < result.totalPages && (
            <Link
              href={`/admin/activity?page=${page + 1}${params.actorId ? `&actorId=${params.actorId}` : ""}${params.action ? `&action=${params.action}` : ""}${params.entityType ? `&entityType=${params.entityType}` : ""}`}
              className="px-3 py-1.5 text-sm border border-white/10 rounded hover:bg-white/5 text-gray-400"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
