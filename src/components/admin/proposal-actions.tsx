// SPEC: SPEC-PAGES > /admin/proposals/[id] — Send, Create Project actions
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendProposal } from "@/lib/actions/proposals";

interface ProposalActionsProps {
  proposalId: string;
  status: string;
}

export function ProposalActions({ proposalId, status }: ProposalActionsProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      const result = await sendProposal(proposalId);
      if (result.success) {
        toast.success("Proposal sent to client!");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Failed to send");
      }
    } catch {
      toast.error("Failed to send proposal");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status === "draft" && (
        <Button
          onClick={handleSend}
          disabled={sending}
          className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
        >
          {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
          Send to Client
        </Button>
      )}
      {status === "accepted" && (
        <Button
          asChild
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <a href="/admin/projects/new">
            <FolderOpen className="h-4 w-4 mr-1" />
            Create Project from Proposal
          </a>
        </Button>
      )}
    </div>
  );
}
