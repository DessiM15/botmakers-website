// SPEC: SPEC-PAGES > /portal/proposals/[id] > Accept section
// DEP-MAP: AI Proposal Generation > UI > acceptance modal
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { acceptProposal } from "@/lib/actions/proposals";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface PortalProposalAcceptProps {
  proposalId: string;
}

export function PortalProposalAccept({ proposalId }: PortalProposalAcceptProps) {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAccept() {
    if (!agreed || !signature.trim()) return;

    setSubmitting(true);
    try {
      const result = await acceptProposal(proposalId, signature.trim());
      if (result.success) {
        toast.success("Proposal accepted! We'll be in touch shortly.");
        setOpen(false);
      } else {
        toast.error(result.error?.message ?? "Failed to accept proposal");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-6 text-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Accept Proposal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Proposal</DialogTitle>
              <DialogDescription>
                By accepting, you agree to the terms and conditions outlined in
                this proposal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={submitting}
                  className="mt-1 h-4 w-4"
                />
                <Label htmlFor="agree-terms" className="text-sm">
                  I agree to the terms and conditions outlined in this proposal
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature">
                  Type your full name as signature
                </Label>
                <Input
                  id="signature"
                  placeholder="Your full name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <Button
                onClick={handleAccept}
                disabled={submitting || !agreed || !signature.trim()}
                className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept & Sign"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
