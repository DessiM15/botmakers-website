// SPEC: SPEC-PAGES > /portal/proposals/[id] — Client Proposal View
// DEP-MAP: AI Proposal Generation > UI > /portal/proposals/[id]
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/auth/helpers";
import { getProposalById } from "@/lib/db/queries/proposals";
import { trackProposalView } from "@/lib/actions/proposals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { CheckCircle2, FileText } from "lucide-react";
import { PortalProposalAccept } from "@/components/portal/portal-proposal-accept";

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
  sent: { label: "Awaiting Review", color: "bg-blue-100 text-blue-800" },
  viewed: { label: "Under Review", color: "bg-purple-100 text-purple-800" },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-800" },
  declined: { label: "Declined", color: "bg-red-100 text-red-800" },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-800" },
};

export default async function PortalProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await requireClient();
  const data = await getProposalById(id);

  if (!data || data.proposal.clientId !== client.id) {
    notFound();
  }

  const { proposal, lineItems } = data;

  // Track view if not already viewed
  if (proposal.status === "sent") {
    trackProposalView(id);
  }

  const isExpired =
    proposal.expiresAt && new Date(proposal.expiresAt) < new Date();
  const canAccept =
    !isExpired &&
    (proposal.status === "sent" || proposal.status === "viewed");
  const isAccepted = proposal.status === "accepted";

  const status = statusLabels[proposal.status] ?? statusLabels.draft;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#033457]" />
            <h1 className="text-2xl font-bold text-[#033457]">
              {proposal.title}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            From Botmakers.ai &middot;{" "}
            {new Date(proposal.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="secondary" className={status.color}>
          {status.label}
        </Badge>
      </div>

      {/* Expired warning */}
      {isExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-red-800">
              This proposal has expired. Please contact us for an updated
              proposal.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scope of Work */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#033457]">
            Scope of Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {proposal.scopeOfWork}
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#033457]">
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {proposal.deliverables}
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#033457]">
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {proposal.termsAndConditions}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#033457]">Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.description}
                      {item.phaseLabel && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({item.phaseLabel})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(item.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    $
                    {Number(proposal.totalAmount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Acceptance Section */}
      {isAccepted ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Accepted on{" "}
                {proposal.acceptedAt
                  ? new Date(proposal.acceptedAt).toLocaleDateString()
                  : ""}
              </p>
              {proposal.clientSignature && (
                <p className="text-sm text-green-700">
                  Signed by: {proposal.clientSignature}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : canAccept ? (
        <PortalProposalAccept proposalId={id} />
      ) : null}
    </div>
  );
}
