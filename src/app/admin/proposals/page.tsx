// SPEC: SPEC-PAGES > /admin/proposals — list with status badges
// DEP-MAP: AI Proposal Generation > UI
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { getProposals, getProposalsByStatus } from "@/lib/db/queries/proposals";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  viewed: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  declined: "bg-red-500/20 text-red-400",
  expired: "bg-orange-500/20 text-orange-400",
};

export default async function ProposalsPage() {
  const [proposalRows, statusSummary] = await Promise.all([
    getProposals(),
    getProposalsByStatus(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <Button asChild className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
          <Link href="/admin/proposals/new"><Plus className="h-4 w-4 mr-1" />New Proposal</Link>
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statusSummary.map((s) => (
          <Card key={s.status} className="border-white/10 bg-white/5 text-white">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 capitalize">{s.status}</p>
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-xs text-gray-500">${parseFloat(s.total).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proposals list */}
      {proposalRows.length === 0 ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-400">No proposals yet</p>
            <p className="text-sm text-gray-500 mb-4">Create your first proposal with AI</p>
            <Button asChild className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
              <Link href="/admin/proposals/new"><Plus className="h-4 w-4 mr-1" />Create Proposal</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposalRows.map((row) => (
            <Link
              key={row.proposal.id}
              href={`/admin/proposals/${row.proposal.id}`}
              className="block"
            >
              <Card className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium truncate">{row.proposal.title}</p>
                      <Badge className={STATUS_COLORS[row.proposal.status] ?? "bg-gray-500/20 text-gray-400"}>
                        {row.proposal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{row.clientName ?? row.leadName ?? "No recipient"}</span>
                      <span>${parseFloat(row.proposal.totalAmount).toLocaleString()}</span>
                      <span>{new Date(row.proposal.createdAt).toLocaleDateString()}</span>
                      <span className="text-gray-500">by {row.createdByName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
