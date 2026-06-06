// SPEC: SPEC-WORKFLOWS > Workflow 2: Referral Submission > Client-side form
// DEP-MAP: Referral > CLIENT > ReferralForm
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, Plus, X } from "lucide-react";

interface ContactFields {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  notes: string;
}

const emptyContact: ContactFields = {
  full_name: "",
  email: "",
  phone: "",
  company_name: "",
  notes: "",
};

export function ReferralForm() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [contacts, setContacts] = useState<ContactFields[]>([{ ...emptyContact }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#03FF00]/10">
          <CheckCircle2 className="h-8 w-8 text-[#03FF00]" />
        </div>
        <h3 className="text-2xl font-semibold text-[#033457]">
          Thanks for the referral!
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We&apos;ll reach out to your contacts shortly. We really appreciate
          you spreading the word.
        </p>
      </div>
    );
  }

  function addContact() {
    if (contacts.length < 5) {
      setContacts([...contacts, { ...emptyContact }]);
    }
  }

  function removeContact(index: number) {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  }

  function updateContact(index: number, field: keyof ContactFields, value: string) {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Client-side validation
    const clientErrors: Record<string, string> = {};
    const referrerName = formData.get("referrer_name") as string;
    const referrerEmail = formData.get("referrer_email") as string;

    if (!referrerName || referrerName.length < 2) clientErrors.referrer_name = "Your name is required";
    if (!referrerEmail || !referrerEmail.includes("@")) clientErrors.referrer_email = "Please enter a valid email";

    contacts.forEach((c, i) => {
      if (!c.full_name || c.full_name.length < 2) clientErrors[`contact_${i}_name`] = "Name is required";
      if (!c.email || !c.email.includes("@")) clientErrors[`contact_${i}_email`] = "Email is required";
    });

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsPending(false);
      return;
    }

    const payload = {
      referrer_name: referrerName,
      referrer_email: referrerEmail,
      referrer_company: (formData.get("referrer_company") as string) || undefined,
      feedback: (formData.get("feedback") as string) || undefined,
      contacts: contacts.map((c) => ({
        full_name: c.full_name,
        email: c.email,
        phone: c.phone || undefined,
        company_name: c.company_name || undefined,
        notes: c.notes || undefined,
      })),
    };

    try {
      const res = await fetch("/api/referrals", {
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
      toast.success("Referral submitted successfully!");
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Your Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#033457]">Your Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="referrer_name">Your Name *</Label>
            <Input id="referrer_name" name="referrer_name" required placeholder="Jane Doe" />
            {errors.referrer_name && <p className="text-sm text-red-500">{errors.referrer_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="referrer_email">Your Email *</Label>
            <Input id="referrer_email" name="referrer_email" type="email" required placeholder="jane@company.com" />
            {errors.referrer_email && <p className="text-sm text-red-500">{errors.referrer_email}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="referrer_company">Your Company</Label>
          <Input id="referrer_company" name="referrer_company" placeholder="Acme Inc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback">How has your experience been with Botmakers?</Label>
          <Textarea id="feedback" name="feedback" rows={3} placeholder="Optional — share your thoughts..." className="resize-none" />
        </div>
      </div>

      {/* Referred Contacts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#033457]">
            Who are you referring?
          </h3>
          {contacts.length < 5 && (
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          )}
        </div>

        {contacts.map((contact, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-5 space-y-4 relative"
          >
            {contacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeContact(index)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Contact {index + 1}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={contact.full_name}
                  onChange={(e) => updateContact(index, "full_name", e.target.value)}
                  placeholder="Contact name"
                  required
                />
                {errors[`contact_${index}_name`] && (
                  <p className="text-sm text-red-500">{errors[`contact_${index}_name`]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                  placeholder="contact@company.com"
                  required
                />
                {errors[`contact_${index}_email`] && (
                  <p className="text-sm text-red-500">{errors[`contact_${index}_email`]}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, "phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={contact.company_name}
                  onChange={(e) => updateContact(index, "company_name", e.target.value)}
                  placeholder="Their company"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={contact.notes}
                onChange={(e) => updateContact(index, "notes", e.target.value)}
                placeholder="Any context about their project needs..."
              />
            </div>
          </div>
        ))}
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
          "Submit Referral"
        )}
      </Button>

      <p className="text-xs text-gray-400 text-center">
        We&apos;ll reach out to your contacts on your behalf. No spam, ever.
      </p>
    </form>
  );
}
