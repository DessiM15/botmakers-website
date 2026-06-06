// SPEC: SPEC-DEPENDENCY-MAP > Lead Management > UI > lead detail
// DEP-MAP: Lead Management > contact info, pipeline selector, AI analysis, notes, contact log
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLead, createContact, convertLeadToClient } from "@/lib/actions/leads";
import { toast } from "sonner";
import { ArrowLeft, Phone, Mail, Building, UserPlus, FileText, MessageSquare, Loader2, CalendarPlus } from "lucide-react";
import { CreateEventModal } from "@/components/admin/create-event-modal";
import { ScheduleSuggestion } from "@/components/admin/schedule-suggestion";
import Link from "next/link";
import type { Lead, TeamUser, PipelineStage, AIAnalysis } from "@/lib/types";

interface LeadDetailProps {
  lead: Lead;
  contacts: Array<{ id: string; type: string; subject: string | null; body: string | null; direction: string; createdAt: Date }>;
  teamMembers: TeamUser[];
  stageLabels: Record<string, string>;
  hasUpcomingEvent?: boolean;
}

const STAGES: PipelineStage[] = [
  "new_lead", "contacted", "discovery_scheduled", "discovery_completed",
  "proposal_sent", "negotiation", "contract_signed", "active_client",
  "project_delivered", "retention",
];

export function LeadDetail({ lead, contacts, teamMembers, stageLabels, hasUpcomingEvent = false }: LeadDetailProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [contactOpen, setContactOpen] = useState(false);
  const analysis = lead.aiInternalAnalysis as AIAnalysis | null;

  function handleNotesBlur() {
    if (notes !== (lead.notes ?? "")) {
      startTransition(async () => {
        const result = await updateLead(lead.id, { notes });
        if (result.success) toast.success("Notes saved");
        else toast.error("Failed to save notes");
      });
    }
  }

  function handleStageChange(stage: PipelineStage) {
    startTransition(async () => {
      const result = await updateLead(lead.id, { pipelineStage: stage });
      if (!result.success) toast.error("Failed to update stage");
    });
  }

  function handleAssignChange(userId: string) {
    startTransition(async () => {
      const result = await updateLead(lead.id, { assignedTo: userId || null });
      if (!result.success) toast.error("Failed to assign");
    });
  }

  function handleConvert() {
    startTransition(async () => {
      const result = await convertLeadToClient(lead.id);
      if (result.success) {
        toast.success("Lead converted to client!");
        router.push(`/admin/clients/${result.data?.id}`);
      } else {
        toast.error(result.error?.message ?? "Failed to convert");
      }
    });
  }

  async function handleLogContact(formData: FormData) {
    const data = {
      type: formData.get("type") as "email" | "phone" | "sms" | "meeting" | "note",
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
      direction: formData.get("direction") as "inbound" | "outbound",
    };

    const result = await createContact(lead.id, data);
    if (result.success) {
      toast.success("Contact logged");
      setContactOpen(false);
    } else {
      toast.error("Failed to log contact");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/leads">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" /> Leads
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{lead.fullName}</h1>
        {lead.convertedToClientId && (
          <Badge className="bg-green-500/20 text-green-400">Converted</Badge>
        )}
      </div>

      {/* Pipeline stage visual selector */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => handleStageChange(stage)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors whitespace-nowrap ${
              lead.pipelineStage === stage
                ? "bg-[#03FF00] text-[#033457] font-semibold"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {stageLabels[stage]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline">{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{lead.phone}</span>
                </div>
              )}
              {lead.companyName && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">{lead.companyName}</span>
                </div>
              )}
              {lead.projectType && (
                <div className="text-gray-400">Project: <span className="text-gray-300">{lead.projectType}</span></div>
              )}
              {lead.projectTimeline && (
                <div className="text-gray-400">Timeline: <span className="text-gray-300">{lead.projectTimeline}</span></div>
              )}
              {lead.projectDetails && (
                <div>
                  <p className="text-gray-400 mb-1">Project Details:</p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{lead.projectDetails}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes about this lead..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Schedule suggestion */}
          <ScheduleSuggestion
            leadId={lead.id}
            leadName={lead.fullName}
            leadEmail={lead.email}
            stage={lead.pipelineStage as PipelineStage}
            hasUpcomingEvent={hasUpcomingEvent}
          />

          {/* Contact log */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Contact Log</CardTitle>
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:text-white">
                    <MessageSquare className="h-3 w-3 mr-1" /> Log Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a1e36] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Log Contact</DialogTitle>
                  </DialogHeader>
                  <form action={handleLogContact} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select name="type" defaultValue="email">
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <Select name="direction" defaultValue="outbound">
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="outbound">Outbound</SelectItem>
                            <SelectItem value="inbound">Inbound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input name="subject" className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Details</Label>
                      <Textarea name="body" className="bg-white/5 border-white/10 min-h-[80px]" />
                    </div>
                    <Button type="submit" className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
                      Save Contact
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500">No contacts logged yet</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex gap-3 text-sm border-b border-white/5 pb-3 last:border-0">
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                          {c.type}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        {c.subject && <p className="font-medium text-gray-300">{c.subject}</p>}
                        {c.body && <p className="text-gray-400 mt-0.5 line-clamp-2">{c.body}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {c.direction} — {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs">Assigned To</Label>
                <Select
                  value={lead.assignedTo ?? "unassigned"}
                  onValueChange={(v) => handleAssignChange(v === "unassigned" ? "" : v)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-gray-300">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!lead.convertedToClientId && (
                <Button
                  onClick={handleConvert}
                  disabled={isPending}
                  className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                  Convert to Client
                </Button>
              )}

              <CreateEventModal
                defaultTitle={`Discovery Call with ${lead.fullName}`}
                defaultLeadId={lead.id}
                defaultAttendees={[{ email: lead.email, name: lead.fullName }]}
                trigger={
                  <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:text-white">
                    <CalendarPlus className="h-4 w-4 mr-1" /> Schedule Meeting
                  </Button>
                }
              />

              <Link href={`/admin/proposals/new?lead_id=${lead.id}`} className="block">
                <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:text-white">
                  <FileText className="h-4 w-4 mr-1" /> Create Proposal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {analysis && (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-base">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Score:</span>
                  <Badge className={
                    analysis.score === "high" ? "bg-green-500/20 text-green-400" :
                    analysis.score === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }>
                    {analysis.score}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-400">Complexity:</span>{" "}
                  <span className="text-gray-300">{analysis.complexity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Est. Value:</span>{" "}
                  <span className="text-gray-300">{analysis.estimatedValue}</span>
                </div>
                {analysis.summary && (
                  <div>
                    <p className="text-gray-400 mb-1">Summary:</p>
                    <p className="text-gray-300">{analysis.summary}</p>
                  </div>
                )}
                {analysis.redFlags.length > 0 && (
                  <div>
                    <p className="text-gray-400 mb-1">Red Flags:</p>
                    <ul className="list-disc pl-4 text-red-400 space-y-0.5">
                      {analysis.redFlags.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
                {analysis.recommendedActions.length > 0 && (
                  <div>
                    <p className="text-gray-400 mb-1">Recommended Actions:</p>
                    <ul className="list-disc pl-4 text-gray-300 space-y-0.5">
                      {analysis.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
