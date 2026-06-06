// SPEC: Booking Widget > Booking Details Form
// DEP-MAP: Booking Widget > CLIENT > BookingForm
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";

interface BookingFormProps {
  selectedDate: string;
  selectedSlot: string;
  timezone: string;
  serverTimezone: string;
  onBack: () => void;
  onSuccess: (result: { meetingLink: string | null }) => void;
}

function formatSummaryDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatSummaryTime(
  slot: string,
  date: string,
  tz: string
): string {
  const d = new Date(`${date}T${slot}:00`);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(d);
}

export function BookingForm({
  selectedDate,
  selectedSlot,
  timezone,
  serverTimezone,
  onBack,
  onSuccess,
}: BookingFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const displayDate = formatSummaryDate(selectedDate);
  const displayTime = formatSummaryTime(selectedSlot, selectedDate, timezone);

  // Get short timezone label
  const tzLabel = (() => {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      }).formatToParts(new Date());
      return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
    } catch {
      return timezone;
    }
  })();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const hp = formData.get("_hp") as string;
    if (hp) {
      setIsPending(false);
      return;
    }

    // Client-side validation
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const company = (formData.get("company") as string).trim();
    const message = (formData.get("message") as string).trim();

    const clientErrors: Record<string, string> = {};
    if (!name || name.length < 2)
      clientErrors.name = "Name must be at least 2 characters";
    if (!email || !email.includes("@"))
      clientErrors.email = "Please enter a valid email";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsPending(false);
      return;
    }

    const payload = {
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      message: message || undefined,
      date: selectedDate,
      start_time: selectedSlot,
      timezone,
    };

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (res.status === 429) {
          toast.error("Too many bookings. Please try again later.");
        } else {
          toast.error(result?.error ?? "Something went wrong. Please try again.");
        }
        setIsPending(false);
        return;
      }

      toast.success("Meeting booked successfully!");
      onSuccess({ meetingLink: result.meetingLink });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary card */}
      <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{displayDate}</p>
            <p className="text-xs text-gray-400">
              {displayTime} {tzLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-[#03FF00] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Change
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Honeypot */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-name" className="text-gray-300 text-xs">
            Name *
          </Label>
          <Input
            id="booking-name"
            name="name"
            required
            placeholder="John Smith"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#03FF00]/60"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-email" className="text-gray-300 text-xs">
            Email *
          </Label>
          <Input
            id="booking-email"
            name="email"
            type="email"
            required
            placeholder="john@company.com"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#03FF00]/60"
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="booking-phone" className="text-gray-300 text-xs">
              Phone
            </Label>
            <Input
              id="booking-phone"
              name="phone"
              type="tel"
              placeholder="+1 555-123-4567"
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#03FF00]/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="booking-company" className="text-gray-300 text-xs">
              Company
            </Label>
            <Input
              id="booking-company"
              name="company"
              placeholder="Acme Inc."
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#03FF00]/60"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-message" className="text-gray-300 text-xs">
            Anything you'd like to discuss?
          </Label>
          <Textarea
            id="booking-message"
            name="message"
            rows={3}
            placeholder="Tell us about your project..."
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#03FF00]/60 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold py-5"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </form>
    </div>
  );
}
