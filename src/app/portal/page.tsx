// SPEC: SPEC-PAGES > /portal — Portal Home
// DEP-MAP: Client Portal > portal dashboard with projects, proposals, invoices
import Link from "next/link";
import { requireClient } from "@/lib/auth/helpers";
import { getProjectsByClientId } from "@/lib/db/queries/projects";
import { getProposals } from "@/lib/db/queries/proposals";
import { getInvoices } from "@/lib/db/queries/invoices";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  FileText,
  Receipt,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export default async function PortalDashboardPage() {
  const client = await requireClient();

  const [projectsList, proposalRows, invoiceRows] = await Promise.all([
    getProjectsByClientId(client.id),
    getProposals({ clientId: client.id }),
    getInvoices({ clientId: client.id }),
  ]);

  // If exactly 1 project and no proposals/invoices, redirect to project
  if (
    projectsList.length === 1 &&
    proposalRows.length === 0 &&
    invoiceRows.length === 0
  ) {
    redirect(`/portal/projects/${projectsList[0].id}`);
  }

  const activeProposals = proposalRows.filter(
    (r) => r.proposal.status === "sent" || r.proposal.status === "viewed"
  );
  const unpaidInvoices = invoiceRows.filter(
    (r) =>
      r.invoice.status === "sent" ||
      r.invoice.status === "viewed" ||
      r.invoice.status === "overdue"
  );

  const hasNoData =
    projectsList.length === 0 &&
    proposalRows.length === 0 &&
    invoiceRows.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#033457]">
          Welcome, {client.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your projects and documents.
        </p>
      </div>

      {hasNoData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-lg font-semibold text-[#033457]">
              No active projects found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact{" "}
              <a
                href="mailto:info@botmakers.ai"
                className="text-[#1E40AF] underline"
              >
                info@botmakers.ai
              </a>{" "}
              for assistance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <FolderOpen className="h-5 w-5 text-[#03FF00]" />
                <CardTitle className="text-base">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#033457]">
                  {projectsList.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {projectsList.filter((p) => p.status === "in_progress").length}{" "}
                  active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <FileText className="h-5 w-5 text-[#03FF00]" />
                <CardTitle className="text-base">Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#033457]">
                  {activeProposals.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  awaiting your review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Receipt className="h-5 w-5 text-[#03FF00]" />
                <CardTitle className="text-base">Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#033457]">
                  {unpaidInvoices.length}
                </p>
                <p className="text-xs text-muted-foreground">unpaid</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Proposals */}
          {activeProposals.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#033457]">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Proposals Awaiting Review
              </h2>
              {activeProposals.map((row) => (
                <Card key={row.proposal.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{row.proposal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        $
                        {Number(row.proposal.totalAmount).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/portal/proposals/${row.proposal.id}`}>
                        Review
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Projects */}
          {projectsList.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#033457]">
                <FolderOpen className="h-5 w-5" />
                Your Projects
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {projectsList.map((project) => (
                  <Link
                    key={project.id}
                    href={`/portal/projects/${project.id}`}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{project.name}</p>
                            <Badge
                              variant="secondary"
                              className={
                                statusColors[project.status] ?? ""
                              }
                            >
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium text-[#033457]">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-[#03FF00] transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {project.completedMilestones} of{" "}
                            {project.totalMilestones} milestones complete
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Unpaid Invoices */}
          {unpaidInvoices.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#033457]">
                <Receipt className="h-5 w-5" />
                Outstanding Invoices
              </h2>
              {unpaidInvoices.map((row) => (
                <Card key={row.invoice.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{row.invoice.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          $
                          {Number(row.invoice.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        {row.invoice.dueDate && (
                          <>
                            <span>&middot;</span>
                            <span>
                              Due{" "}
                              {new Date(
                                row.invoice.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/portal/invoices/${row.invoice.id}`}>
                        View
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
