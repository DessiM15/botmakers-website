// SPEC: SPEC-WORKFLOWS > Workflow 1: Lead Submission > Client-side form
// DEP-MAP: Lead Management > CLIENT > LeadForm
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";

const PROJECT_TYPES = [
  "Web Application",
  "Mobile App",
  "SaaS Product",
  "AI Integration",
  "Automation / Workflow",
  "E-commerce",
  "Internal Tool",
  "API Development",
  "Other",
];

const TIMELINES = [
  "ASAP",
  "1-2 weeks",
  "1 month",
  "2-3 months",
  "3-6 months",
  "No rush — exploring options",
];

export function LeadForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectType, setProjectType] = useState("");
  const [projectTimeline, setProjectTimeline] = useState("");

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#03FF00]/10">
          <CheckCircle2 className="h-8 w-8 text-[#03FF00]" />
        </div>
        <h3 className="text-2xl font-semibold text-[#033457]">Thank you!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We received your project details and will be in touch within 24 hours.
          Check your email for a confirmation.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Client-side validation
    const clientErrors: Record<string, string> = {};
    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const details = formData.get("project_details") as string;

    if (!fullName || fullName.length < 2) clientErrors.full_name = "Name must be at least 2 characters";
    if (!email || !email.includes("@")) clientErrors.email = "Please enter a valid email";
    if (!projectType) clientErrors.project_type = "Please select a project type";
    if (!projectTimeline) clientErrors.project_timeline = "Please select a timeline";
    if (!details || details.length < 50) clientErrors.project_details = "Please provide at least 50 characters about your project";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsPending(false);
      return;
    }

    const payload = {
      full_name: fullName,
      email,
      phone: formData.get("phone") as string || undefined,
      company_name: formData.get("company_name") as string || undefined,
      project_type: projectType,
      project_timeline: projectTimeline,
      existing_systems: formData.get("existing_systems") as string || undefined,
      project_details: details,
      preferred_contact: "email",
      sms_consent: false,
      _hp: formData.get("_hp") as string || "",
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (res.status === 429) {
          toast.error("Too many submissions. Please try again later.");
        } else {
          toast.error(result?.error?.message ?? "Something went wrong. Please try again.");
        }
        setIsPending(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Submitted successfully!");
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from users, catches bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" name="full_name" required placeholder="John Smith" />
          {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required placeholder="john@company.com" />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company</Label>
          <Input id="company_name" name="company_name" placeholder="Acme Inc." />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project Type *</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.project_type && <p className="text-sm text-red-500">{errors.project_type}</p>}
        </div>
        <div className="space-y-2">
          <Label>Timeline *</Label>
          <Select value={projectTimeline} onValueChange={setProjectTimeline}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeline..." />
            </SelectTrigger>
            <SelectContent>
              {TIMELINES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.project_timeline && <p className="text-sm text-red-500">{errors.project_timeline}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="existing_systems">Existing Systems</Label>
        <Input
          id="existing_systems"
          name="existing_systems"
          placeholder="e.g., WordPress, Shopify, custom CRM..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_details">Tell us about your project * <span className="text-xs text-gray-400 font-normal">(min 50 characters)</span></Label>
        <Textarea
          id="project_details"
          name="project_details"
          required
          rows={5}
          placeholder="Describe your project, goals, and any specific requirements..."
          className="resize-none"
        />
        {errors.project_details && <p className="text-sm text-red-500">{errors.project_details}</p>}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold py-6 text-base"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" />
            Submitting...
          </>
        ) : (
          "Get Started"
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        We&apos;ll review your project and respond within 24 hours. No spam, ever.
      </p>
    </form>
  );
}
