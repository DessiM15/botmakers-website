// SPEC: Calendar ↔ CRM Integration > Feature 2: Pipeline-Triggered Scheduling Suggestions
"use client";

import { useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { CreateEventModal } from "@/components/admin/create-event-modal";
import { Button } from "@/components/ui/button";
import type { PipelineStage } from "@/lib/types";
import type { EventType } from "@/lib/types/calendar";

interface SuggestionConfig {
  message: string;
  eventType: EventType;
  titlePrefix: string;
}

const STAGE_SUGGESTIONS: Partial<Record<PipelineStage, SuggestionConfig>> = {
  contacted: {
    message: "Schedule a discovery call",
    eventType: "discovery_call",
    titlePrefix: "Discovery Call with",
  },
  discovery_completed: {
    message: "Schedule a proposal review",
    eventType: "follow_up",
    titlePrefix: "Proposal Review with",
  },
  proposal_sent: {
    message: "Schedule a follow-up call",
    eventType: "follow_up",
    titlePrefix: "Follow-Up Call with",
  },
  negotiation: {
    message: "Schedule a closing meeting",
    eventType: "client_meeting",
    titlePrefix: "Closing Meeting with",
  },
};

interface ScheduleSuggestionProps {
  leadId: string;
  leadName: string;
  leadEmail: string;
  stage: PipelineStage;
  hasUpcomingEvent: boolean;
}

export function ScheduleSuggestion({
  leadId,
  leadName,
  leadEmail,
  stage,
  hasUpcomingEvent,
}: ScheduleSuggestionProps) {
  const [dismissed, setDismissed] = useState(false);

  const suggestion = STAGE_SUGGESTIONS[stage];
  if (!suggestion || hasUpcomingEvent || dismissed) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
      <CalendarClock className="h-5 w-5 flex-shrink-0 text-blue-400" />
      <p className="flex-1 text-sm text-blue-300">{suggestion.message}</p>
      <CreateEventModal
        defaultTitle={`${suggestion.titlePrefix} ${leadName}`}
        defaultLeadId={leadId}
        defaultAttendees={[{ email: leadEmail, name: leadName }]}
        trigger={
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Schedule
          </Button>
        }
      />
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-500 hover:text-gray-300"
        aria-label="Dismiss suggestion"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
