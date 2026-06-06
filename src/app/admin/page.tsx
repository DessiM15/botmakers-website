// SPEC: SPEC-PAGES > /admin — Dashboard with greeting, metrics, alerts, activity, quick actions
// DEP-MAP: CRM Dashboard > SERVER + UI
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, FolderOpen, DollarSign, TrendingUp, AlertTriangle,
  Clock, MessageSquare, Plus, FileText, Receipt, Calendar, Video,
} from "lucide-react";
import { getMetrics, getAlerts, getRecentActivity } from "@/lib/db/queries/dashboard";
import { requireTeam } from "@/lib/auth/helpers";
import { PIPELINE_STAGE_LABELS } from "@/lib/types/constants";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getActivityIcon(action: string) {
  if (action.startsWith("lead")) return <Users className="h-3.5 w-3.5" />;
  if (action.startsWith("project") || action.startsWith("milestone")) return <FolderOpen className="h-3.5 w-3.5" />;
  if (action.startsWith("proposal")) return <FileText className="h-3.5 w-3.5" />;
  if (action.startsWith("invoice") || action.startsWith("payment")) return <Receipt className="h-3.5 w-3.5" />;
  if (action.startsWith("question")) return <MessageSquare className="h-3.5 w-3.5" />;
  if (action.startsWith("meeting")) return <Calendar className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

function getEntityLink(entityType: string, entityId: string): string | null {
  const routes: Record<string, string> = {
    lead: `/admin/leads/${entityId}`,
    project: `/admin/projects/${entityId}`,
    proposal: `/admin/proposals/${entityId}`,
    invoice: `/admin/invoices/${entityId}`,
    milestone: `/admin/projects`,
    question: `/admin/projects`,
    meeting: `/admin/calendar`,
    calendar_event: `/admin/calendar`,
  };
  return routes[entityType] ?? null;
}

export default async function AdminDashboardPage() {
  const user = await requireTeam();
  const [metrics, alerts, activity] = await Promise.all([
    getMetrics(),
    getAlerts(),
    getRecentActivity(15),
  ]);

  const alertCount =
    alerts.staleLeads.length +
    alerts.overdueMilestones.length +
    alerts.pendingQuestions.length +
    alerts.upcomingEvents.length;

  return (
    <div className="space-y-6">
      {/* Greeting bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user.fullName.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-400">{formatDate()}</p>
        </div>
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
            <Link href="/admin/leads"><Plus className="h-4 w-4 mr-1" />Lead</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/admin/projects/new"><FolderOpen className="h-4 w-4 mr-1" />Project</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/admin/proposals/new"><FileText className="h-4 w-4 mr-1" />Proposal</Link>
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Leads This Week</CardTitle>
            <Users className="h-4 w-4 text-[#03FF00]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.leadsThisWeek}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-[#03FF00]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.activeProjects}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-[#03FF00]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${parseFloat(metrics.pipelineValue).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Revenue (MTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#03FF00]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${parseFloat(metrics.revenueThisMonth).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Alerts
              {alertCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 text-xs">{alertCount}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertCount === 0 ? (
              <p className="text-sm text-gray-400">No active alerts</p>
            ) : (
              <>
                {alerts.staleLeads.length > 0 && (
                  <Link href="/admin/leads" className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 hover:bg-yellow-500/10 transition">
                    <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400">{alerts.staleLeads.length} stale lead{alerts.staleLeads.length > 1 ? "s" : ""}</p>
                      <p className="text-xs text-gray-500">No activity in 7+ days</p>
                    </div>
                  </Link>
                )}
                {alerts.overdueMilestones.length > 0 && (
                  <Link href="/admin/projects" className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition">
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-400">{alerts.overdueMilestones.length} overdue milestone{alerts.overdueMilestones.length > 1 ? "s" : ""}</p>
                      <p className="text-xs text-gray-500">Past due date</p>
                    </div>
                  </Link>
                )}
                {alerts.pendingQuestions.length > 0 && (
                  <Link href="/admin/projects" className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition">
                    <MessageSquare className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-400">{alerts.pendingQuestions.length} pending question{alerts.pendingQuestions.length > 1 ? "s" : ""}</p>
                      <p className="text-xs text-gray-500">Awaiting reply</p>
                    </div>
                  </Link>
                )}
                {alerts.upcomingEvents.length > 0 && (
                  <div className="space-y-2">
                    <Link href="/admin/calendar" className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition">
                      <Calendar className="h-4 w-4 text-[#03FF00] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#03FF00]">{alerts.upcomingEvents.length} upcoming meeting{alerts.upcomingEvents.length > 1 ? "s" : ""}</p>
                      </div>
                    </Link>
                    {alerts.upcomingEvents.map((evt) => (
                      <div key={evt.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 ml-4">
                        <Video className="h-3.5 w-3.5 text-[#03FF00] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{evt.title}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(evt.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
                            {new Date(evt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                        {evt.meetingLink && (
                          <a href={evt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#03FF00] hover:underline flex-shrink-0">
                            Join
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Link href="/admin/activity" className="text-xs text-[#03FF00] hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activity.map((entry) => {
                  const link = getEntityLink(entry.entityType, entry.entityId);
                  const content = (
                    <div className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 text-[#03FF00] flex-shrink-0">
                        {getActivityIcon(entry.action)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-300 truncate">
                          {entry.action.replace(/[._]/g, " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                  return link ? (
                    <Link key={entry.id} href={link} className="block rounded-lg p-1 hover:bg-white/5 transition">
                      {content}
                    </Link>
                  ) : (
                    <div key={entry.id} className="p-1">{content}</div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
