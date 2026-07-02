// SPEC: Homepage quick contact form — simplified 4-field version
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";

export function QuickContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#03FF00]/10">
          <CheckCircle2 className="h-8 w-8 text-[#03FF00]" />
        </div>
        <h3 className="text-2xl font-semibold text-[#033457]">Thank you!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We&apos;ll review your message and get back to you within 24 hours.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message || message.length < 10) {
      toast.error("Please fill in all required fields.");
      setIsPending(false);
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          email,
          company_name: (formData.get("company") as string) || undefined,
          project_type: "General Inquiry",
          project_timeline: "No rush — exploring options",
          project_details: message,
          preferred_contact: "email",
          sms_consent: false,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result?.error?.message ?? "Something went wrong.");
        setIsPending(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Message sent!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qc_name">Name *</Label>
          <Input
            id="qc_name"
            name="full_name"
            required
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qc_email">Email *</Label>
          <Input
            id="qc_email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="qc_company">Company</Label>
        <Input
          id="qc_company"
          name="company"
          placeholder="Your company (optional)"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qc_message">Message *</Label>
        <Textarea
          id="qc_message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your project or how we can help..."
          className="resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold py-6 text-base"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        We&apos;ll respond within 24 hours. No spam, ever.
      </p>
    </form>
  );
}
