"use client";

import { useState, useMemo } from "react";
import { Send, Loader2, CheckCircle, ArrowRight, User } from "lucide-react";
import {
  ReferralFormData,
  ReferralSlot,
  EMPTY_REFERRAL_SLOT,
  MAX_REFERRAL_SLOTS,
} from "@/lib/types";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function phoneToE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `+1${digits}`;
}

export default function ReferralForm() {
  const [formData, setFormData] = useState<ReferralFormData>({
    referrerName: "",
    referrerEmail: "",
    referrerCompany: "",
    industryFeedback: "",
    referrals: Array.from({ length: MAX_REFERRAL_SLOTS }, () => ({
      ...EMPTY_REFERRAL_SLOT,
    })),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const unlockedSlots = useMemo(() => {
    const unlocked = [true];
    for (let i = 1; i < MAX_REFERRAL_SLOTS; i++) {
      unlocked.push(formData.referrals[i - 1].name.trim().length > 0);
    }
    return unlocked;
  }, [formData.referrals]);

  const isSlotComplete = (slot: ReferralSlot) =>
    slot.name.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(slot.email) &&
    slot.phone.replace(/\D/g, "").length === 10;

  const completedCount = useMemo(
    () => formData.referrals.filter(isSlotComplete).length,
    [formData.referrals]
  );

  const updateReferrerField = (
    field: "referrerName" | "referrerEmail" | "referrerCompany" | "industryFeedback",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateReferralField = (
    index: number,
    field: keyof ReferralSlot,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.referrals];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, referrals: updated };
    });
    const errorKey = `referral_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.referrerName.trim()) {
      newErrors.referrerName = "Your name is required";
    }

    if (!formData.referrerEmail.trim()) {
      newErrors.referrerEmail = "Your email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.referrerEmail)
    ) {
      newErrors.referrerEmail = "Please enter a valid email address";
    }

    // Check at least 1 complete referral
    const filledSlots = formData.referrals.filter(
      (s) => s.name.trim() || s.email.trim() || s.phone.trim()
    );

    if (filledSlots.length === 0) {
      newErrors.referral_0_name = "At least one referral is required";
    }

    // Validate each partially-filled slot
    formData.referrals.forEach((slot, i) => {
      const hasAny =
        slot.name.trim() || slot.email.trim() || slot.phone.trim();
      if (!hasAny) return;

      if (!slot.name.trim()) {
        newErrors[`referral_${i}_name`] = "Name is required";
      }

      if (!slot.email.trim()) {
        newErrors[`referral_${i}_email`] = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(slot.email)) {
        newErrors[`referral_${i}_email`] = "Please enter a valid email";
      }

      const digits = slot.phone.replace(/\D/g, "");
      if (!digits) {
        newErrors[`referral_${i}_phone`] = "Phone is required";
      } else if (digits.length !== 10) {
        newErrors[`referral_${i}_phone`] = "Please enter a valid 10-digit number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (honeypot) return;

    setIsSubmitting(true);
    try {
      const filledReferrals = formData.referrals
        .filter((s) => s.name.trim())
        .map((s) => ({
          ...s,
          name: s.name.trim(),
          email: s.email.trim().toLowerCase(),
          phone: phoneToE164(s.phone),
          company: s.company.trim(),
        }));

      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: formData.referrerName.trim(),
          referrerEmail: formData.referrerEmail.trim().toLowerCase(),
          referrerCompany: formData.referrerCompany.trim(),
          industryFeedback: formData.industryFeedback.trim(),
          referrals: filledReferrals,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          setErrors({
            form: "Too many submissions. Please try again later.",
          });
        } else {
          setErrors({
            form: data.error || "Something went wrong. Please try again.",
          });
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrors({
        form: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 lg:p-12 text-center"
        data-aos="fade-up"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#03FF00]/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[#03FF00]" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Thank You for the Referrals!
        </h3>
        <p className="text-white/60 font-light max-w-lg mx-auto mb-2">
          We appreciate you connecting us with your network. We&apos;ll reach
          out to each person with a personalized introduction.
        </p>
        <p className="text-[#03FF00] font-medium mb-8">
          Your referrals are in great hands.
        </p>
        <a href="/" className="btn-default btn-highlighted inline-flex">
          <span>Back to Botmakers.ai</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 lg:p-12"
      data-aos="fade-up"
    >
      {/* Honeypot */}
      <div
        className="absolute opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      >
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Global form error */}
      {errors.form && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-red-400 text-sm">{errors.form}</p>
        </div>
      )}

      {/* Section 1: Your Information */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#03FF00] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-[#033457]">1</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Your Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Full Name <span className="text-[#03FF00]">*</span>
            </label>
            <input
              type="text"
              value={formData.referrerName}
              onChange={(e) => updateReferrerField("referrerName", e.target.value)}
              placeholder="Your full name"
              className={`w-full bg-white/5 border ${errors.referrerName ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors`}
            />
            {errors.referrerName && (
              <p className="text-red-400 text-xs mt-1">{errors.referrerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Email Address <span className="text-[#03FF00]">*</span>
            </label>
            <input
              type="email"
              value={formData.referrerEmail}
              onChange={(e) =>
                updateReferrerField("referrerEmail", e.target.value)
              }
              placeholder="you@company.com"
              className={`w-full bg-white/5 border ${errors.referrerEmail ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors`}
            />
            {errors.referrerEmail && (
              <p className="text-red-400 text-xs mt-1">
                {errors.referrerEmail}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            Company{" "}
            <span className="text-white/30 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.referrerCompany}
            onChange={(e) =>
              updateReferrerField("referrerCompany", e.target.value)
            }
            placeholder="Your company or firm"
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
          />
        </div>
      </div>

      {/* Section 2: Your Feedback */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#03FF00] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-[#033457]">2</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Your Feedback</h3>
          <span className="text-white/30 text-xs">(optional)</span>
        </div>

        <textarea
          value={formData.industryFeedback}
          onChange={(e) =>
            updateReferrerField("industryFeedback", e.target.value)
          }
          placeholder="What tools, services, or solutions would be most valuable to you and your industry right now?"
          rows={4}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors resize-none"
        />
      </div>

      {/* Section 3: Your Referrals */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-[#03FF00] rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-[#033457]">3</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Your Referrals</h3>
        </div>

        {/* Progress pills */}
        <div className="flex items-center gap-3 mb-6">
          {Array.from({ length: MAX_REFERRAL_SLOTS }, (_, i) => {
            const complete = isSlotComplete(formData.referrals[i]);
            const active = unlockedSlots[i];
            return (
              <div
                key={i}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  complete
                    ? "bg-[#03FF00] text-[#033457]"
                    : active
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/30"
                }`}
              >
                {complete ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
            );
          })}
          <span className="text-white/40 text-xs ml-2">
            {completedCount} of {MAX_REFERRAL_SLOTS} filled
          </span>
        </div>

        {/* Referral cards */}
        <div className="space-y-4">
          {formData.referrals.map((slot, i) => {
            const active = unlockedSlots[i];
            const complete = isSlotComplete(slot);

            return (
              <div
                key={i}
                className={`border rounded-lg p-5 transition-all ${
                  complete
                    ? "border-[#03FF00]/30 bg-[#03FF00]/5"
                    : active
                      ? "border-white/20 bg-white/5"
                      : "border-white/10 bg-white/[0.02] opacity-40 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-medium text-white/60">
                    Referral {i + 1}
                    {i === 0 && (
                      <span className="text-[#03FF00] ml-1">*</span>
                    )}
                  </span>
                  {complete && (
                    <CheckCircle className="w-4 h-4 text-[#03FF00] ml-auto" />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) =>
                        updateReferralField(i, "name", e.target.value)
                      }
                      placeholder="Contact's full name"
                      className={`w-full bg-white/5 border ${errors[`referral_${i}_name`] ? "border-red-400" : "border-white/15"} rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#03FF00] transition-colors`}
                    />
                    {errors[`referral_${i}_name`] && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors[`referral_${i}_name`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={slot.email}
                      onChange={(e) =>
                        updateReferralField(i, "email", e.target.value)
                      }
                      placeholder="contact@company.com"
                      className={`w-full bg-white/5 border ${errors[`referral_${i}_email`] ? "border-red-400" : "border-white/15"} rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#03FF00] transition-colors`}
                    />
                    {errors[`referral_${i}_email`] && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors[`referral_${i}_email`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={slot.phone}
                      onChange={(e) =>
                        updateReferralField(i, "phone", formatPhone(e.target.value))
                      }
                      placeholder="(555) 123-4567"
                      className={`w-full bg-white/5 border ${errors[`referral_${i}_phone`] ? "border-red-400" : "border-white/15"} rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#03FF00] transition-colors`}
                    />
                    {errors[`referral_${i}_phone`] && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors[`referral_${i}_phone`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">
                      Company{" "}
                      <span className="text-white/20">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={slot.company}
                      onChange={(e) =>
                        updateReferralField(i, "company", e.target.value)
                      }
                      placeholder="Company or firm"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#03FF00] transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || completedCount === 0}
          className="btn-default btn-highlighted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>
                SUBMIT {completedCount} REFERRAL
                {completedCount !== 1 ? "S" : ""}
              </span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
