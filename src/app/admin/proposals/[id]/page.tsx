// SPEC: SPEC-PAGES > /admin/proposals/[id] — detail with status timeline
// DEP-MAP: AI Proposal Generation > UI
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProposalById } from "@/lib/db/queries/proposals";
import { ProposalActions } from "@/components/admin/proposal-actions";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  viewed: "bg-yellow-500/20 text-yellow-400",
  accepted: "bg-green-500/20 text-green-400",
  declined: "bg-red-500/20 text-red-400",
  expired: "bg-orange-500/20 text-orange-400",
};

const STATUS_ORDER = ["draft", "sent", "viewed", "accepted"];

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProposalById(id);

  if (!data) return notFound();

  const { proposal, lineItems, clientName, clientEmail, leadName, leadEmail, createdByName } = data;
  const recipientName = clientName ?? leadName ?? "Unknown";
  const total = parseFloat(proposal.totalAmount);
  const currentStatusIdx = STATUS_ORDER.indexOf(proposal.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
          <Link href="/admin/proposals"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1 truncate">{proposal.title}</h1>
        <Badge className={STATUS_COLORS[proposal.status] ?? ""}>
          {proposal.status}
        </Badge>
      </div>

      {/* Status timeline */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {STATUS_ORDER.map((status, idx) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                idx <= currentStatusIdx ? "bg-[#03FF00]" : "bg-white/20"
              }`}
            />
            <span className={`text-xs capitalize whitespace-nowrap ${
              idx <= currentStatusIdx ? "text-[#03FF00]" : "text-gray-500"
            }`}>
              {status}
            </span>
            {idx < STATUS_ORDER.length - 1 && (
              <div className={`w-8 h-px ${idx < currentStatusIdx ? "bg-[#03FF00]" : "bg-white/20"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <ProposalActions proposalId={id} status={proposal.status} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.scopeOfWork}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.deliverables}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-gray-300">{item.description}</p>
                      {item.phaseLabel && (
                        <p className="text-xs text-gray-500">{item.phaseLabel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p>{parseFloat(item.quantity)} x ${parseFloat(item.unitPrice).toLocaleString()}</p>
                      <p className="font-medium">${parseFloat(item.total).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.termsAndConditions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Recipient</p>
                <p>{recipientName}</p>
                <p className="text-gray-400">{clientEmail ?? leadEmail ?? ""}</p>
              </div>
              <div>
                <p className="text-gray-500">Pricing Type</p>
                <p className="capitalize">{proposal.pricingType}</p>
              </div>
              <div>
                <p className="text-gray-500">Created By</p>
                <p>{createdByName}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(proposal.createdAt).toLocaleDateString()}</p>
              </div>
              {proposal.sentAt && (
                <div>
                  <p className="text-gray-500">Sent</p>
                  <p>{new Date(proposal.sentAt).toLocaleDateString()}</p>
                </div>
              )}
              {proposal.viewedAt && (
                <div>
                  <p className="text-gray-500">Viewed</p>
                  <p>{new Date(proposal.viewedAt).toLocaleDateString()}</p>
                </div>
              )}
              {proposal.acceptedAt && (
                <div>
                  <p className="text-gray-500">Accepted</p>
                  <p>{new Date(proposal.acceptedAt).toLocaleDateString()}</p>
                </div>
              )}
              {proposal.clientSignature && (
                <div>
                  <p className="text-gray-500">Client Signature</p>
                  <p className="italic">{proposal.clientSignature}</p>
                </div>
              )}
              {proposal.aiGenerated && (
                <Badge className="bg-purple-500/20 text-purple-400">AI Generated</Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
