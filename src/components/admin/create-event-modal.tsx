// SPEC: Google Calendar Integration > Create Event Modal
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createCalendarEvent } from "@/lib/actions/calendar";

const EVENT_TYPES = [
  { value: "discovery_call", label: "Discovery Call" },
  { value: "client_meeting", label: "Client Meeting" },
  { value: "internal", label: "Internal" },
  { value: "follow_up", label: "Follow Up" },
  { value: "demo_booking", label: "Demo Booking" },
  { value: "other", label: "Other" },
];

const DURATIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
];

interface CreateEventModalProps {
  onClose?: () => void;
  trigger?: React.ReactNode;
  defaultTitle?: string;
  defaultLeadId?: string;
  defaultClientId?: string;
  defaultProjectId?: string;
  defaultAttendees?: Array<{ name: string; email: string }>;
}

export function CreateEventModal({
  onClose,
  trigger,
  defaultTitle = "",
  defaultLeadId,
  defaultClientId,
  defaultProjectId,
  defaultAttendees = [],
}: CreateEventModalProps) {
  const [open, setOpen] = useState(!trigger);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(defaultTitle);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("30");
  const [eventType, setEventType] = useState("other");
  const [description, setDescription] = useState("");
  const [attendees, setAttendees] = useState(defaultAttendees);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [addMeetLink, setAddMeetLink] = useState(true);

  function addAttendee() {
    const email = attendeeInput.trim();
    if (!email || !email.includes("@")) return;
    if (attendees.some((a) => a.email === email)) return;
    setAttendees([...attendees, { name: "", email }]);
    setAttendeeInput("");
  }

  function removeAttendee(email: string) {
    setAttendees(attendees.filter((a) => a.email !== email));
  }

  function handleSubmit() {
    if (!title || !date || !startTime) {
      toast.error("Title, date, and time are required");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(
      startDateTime.getTime() + parseInt(duration) * 60 * 1000
    );

    startTransition(async () => {
      const result = await createCalendarEvent({
        title,
        description: description || undefined,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        event_type: eventType as "discovery_call" | "client_meeting" | "internal" | "follow_up" | "demo_booking" | "other",
        attendees,
        add_meet_link: addMeetLink,
        related_lead_id: defaultLeadId ?? null,
        related_client_id: defaultClientId ?? null,
        related_project_id: defaultProjectId ?? null,
      });

      if (result.success) {
        toast.success("Event created");
        router.refresh();
        setOpen(false);
        onClose?.();
      } else {
        toast.error(result.error?.message ?? "Failed to create event");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose?.(); }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-[#0a1929] border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="bg-white/5 border-white/10 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-1.5">
            <Label>Attendees</Label>
            <div className="flex gap-2">
              <Input value={attendeeInput} onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAttendee())}
                placeholder="email@example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
              <Button type="button" onClick={addAttendee} size="sm" variant="outline"
                className="border-white/20 text-white hover:bg-white/10">Add</Button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {attendees.map((a) => (
                  <span key={a.email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300">
                    {a.email}
                    <button onClick={() => removeAttendee(a.email)} className="hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Google Meet toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={addMeetLink} onChange={(e) => setAddMeetLink(e.target.checked)}
              className="rounded border-white/20" />
            Add Google Meet link
          </label>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Optional notes..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>

          <Button onClick={handleSubmit} disabled={isPending}
            className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
