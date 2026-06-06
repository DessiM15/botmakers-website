// SPEC: Google Calendar Integration > Event Detail Dialog
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Video, ExternalLink, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import type { CalendarEvent, Attendee } from "@/lib/types/calendar";

const TYPE_LABELS: Record<string, string> = {
  discovery_call: "Discovery Call",
  demo_booking: "Demo Booking",
  client_meeting: "Client Meeting",
  internal: "Internal",
  follow_up: "Follow Up",
  other: "Other",
};

const TYPE_COLORS: Record<string, string> = {
  discovery_call: "bg-[#03FF00]/20 text-[#03FF00]",
  demo_booking: "bg-[#03FF00]/20 text-[#03FF00]",
  client_meeting: "bg-[#033457]/60 text-white",
  internal: "bg-gray-500/20 text-gray-300",
  follow_up: "bg-blue-500/20 text-blue-300",
  other: "bg-gray-400/20 text-gray-400",
};

interface EventDetailDialogProps {
  event: CalendarEvent;
  onClose: () => void;
}

export function EventDetailDialog({ event, onClose }: EventDetailDialogProps) {
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const durationMins = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60)
  );
  const attendees = (event.attendees as Attendee[] | null) ?? [];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="bg-[#0a1929] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Badge className={TYPE_COLORS[event.eventType] ?? TYPE_COLORS.other}>
            {TYPE_LABELS[event.eventType] ?? event.eventType}
          </Badge>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>
              {start.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              {start.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {end.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="text-gray-500">({durationMins} min)</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.location}</span>
            </div>
          )}

          {attendees.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>Attendees</span>
              </div>
              <div className="ml-6 space-y-1">
                {attendees.map((a, i) => (
                  <p key={i} className="text-sm text-gray-300">
                    {a.name || a.email}
                    {a.name && (
                      <span className="text-gray-500 ml-1">({a.email})</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}

          {event.description && (
            <p className="text-sm text-gray-400 whitespace-pre-wrap">
              {event.description}
            </p>
          )}

          {event.bookedByName && (
            <div className="text-sm text-gray-400 p-3 rounded-lg bg-white/5">
              <p className="font-medium text-gray-300">Booked by</p>
              <p>{event.bookedByName}</p>
              {event.bookedByEmail && <p>{event.bookedByEmail}</p>}
              {event.bookedByCompany && <p>{event.bookedByCompany}</p>}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {event.meetingLink && (
              <Button asChild size="sm" className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
                <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-1" />
                  Join Meeting
                </a>
              </Button>
            )}
            {event.googleHtmlLink && (
              <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <a href={event.googleHtmlLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Google Calendar
                </a>
              </Button>
            )}
          </div>

          {/* Related entity links */}
          <div className="flex gap-2 flex-wrap">
            {event.relatedLeadId && (
              <Button asChild variant="ghost" size="sm" className="text-[#03FF00] hover:bg-white/5">
                <Link href={`/admin/leads/${event.relatedLeadId}`}>View Lead</Link>
              </Button>
            )}
            {event.relatedClientId && (
              <Button asChild variant="ghost" size="sm" className="text-[#03FF00] hover:bg-white/5">
                <Link href={`/admin/clients/${event.relatedClientId}`}>View Client</Link>
              </Button>
            )}
            {event.relatedProjectId && (
              <Button asChild variant="ghost" size="sm" className="text-[#03FF00] hover:bg-white/5">
                <Link href={`/admin/projects/${event.relatedProjectId}`}>View Project</Link>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
