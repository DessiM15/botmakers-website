"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react";
import { PROJECT_TYPES, PROJECT_TIMELINES } from "@/lib/types";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectType: string;
  projectTimeline: string;
  projectDetails: string;
  smsConsent: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  projectType: "",
  projectTimeline: "",
  projectDetails: "",
  smsConsent: false,
};

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

export default function LeadForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Honeypot field for bot detection
  const [honeypot, setHoneypot] = useState("");

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      newErrors.phone = "Phone number is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type";
    }

    if (!formData.projectTimeline) {
      newErrors.projectTimeline = "Please select a timeline";
    }

    if (!formData.projectDetails.trim()) {
      newErrors.projectDetails = "Project details are required";
    } else if (formData.projectDetails.trim().length < 50) {
      newErrors.projectDetails = `Please provide at least 50 characters (${formData.projectDetails.trim().length}/50)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    // Honeypot check
    if (honeypot) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: phoneToE164(formData.phone),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          setErrors({ projectDetails: "Too many submissions. Please try again later." });
        } else {
          setErrors({ projectDetails: data.error || "Something went wrong. Please try again." });
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrors({ projectDetails: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 lg:p-12 text-center" data-aos="fade-up">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#03FF00]/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[#03FF00]" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Thank You!
        </h3>
        <p className="text-white/60 font-light max-w-lg mx-auto mb-2">
          We&apos;re reviewing your project and you&apos;ll receive a personalized
          summary shortly.
        </p>
        <p className="text-[#03FF00] font-medium">
          Want to fast-track? Book a call below.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 lg:p-12" data-aos="fade-up">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Tell Us About Your Project
        </h3>
        <p className="text-white/50 font-light text-sm">
          Fill out the form below and our AI will generate a tailored project summary for you.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? "text-[#03FF00]" : "text-white/40"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-[#03FF00] text-[#033457]" : "bg-white/20 text-white"}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          Contact Info
        </div>
        <div className="flex-1 h-px bg-white/20" />
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? "text-[#03FF00]" : "text-white/40"}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-[#03FF00] text-[#033457]" : "bg-white/20 text-white"}`}>
            2
          </div>
          Project Details
        </div>
      </div>

      {/* Honeypot - hidden from users */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Step 1: Contact Info */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Full Name <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="John Smith"
                className={`w-full bg-white/5 border ${errors.fullName ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors`}
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Email Address <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john@company.com"
                className={`w-full bg-white/5 border ${errors.email ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Phone Number <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                placeholder="(555) 123-4567"
                className={`w-full bg-white/5 border ${errors.phone ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Company Name <span className="text-white/30 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="Acme Corp"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
              />
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="btn-default btn-highlighted"
            >
              <span>Next: Project Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Project Details */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Project Type <span className="text-[#03FF00]">*</span>
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => updateField("projectType", e.target.value)}
                className={`w-full bg-white/5 border ${errors.projectType ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#03FF00] transition-colors appearance-none`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value="" className="bg-gray-900">Select project type...</option>
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-gray-900">
                    {type}
                  </option>
                ))}
              </select>
              {errors.projectType && <p className="text-red-400 text-xs mt-1">{errors.projectType}</p>}
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Project Timeline <span className="text-[#03FF00]">*</span>
              </label>
              <select
                value={formData.projectTimeline}
                onChange={(e) => updateField("projectTimeline", e.target.value)}
                className={`w-full bg-white/5 border ${errors.projectTimeline ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#03FF00] transition-colors appearance-none`}
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value="" className="bg-gray-900">Select timeline...</option>
                {PROJECT_TIMELINES.map((timeline) => (
                  <option key={timeline} value={timeline} className="bg-gray-900">
                    {timeline}
                  </option>
                ))}
              </select>
              {errors.projectTimeline && <p className="text-red-400 text-xs mt-1">{errors.projectTimeline}</p>}
            </div>
          </div>

          {/* Project Details */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Project Details <span className="text-[#03FF00]">*</span>
            </label>
            <textarea
              value={formData.projectDetails}
              onChange={(e) => updateField("projectDetails", e.target.value)}
              placeholder="Describe your project, goals, challenges, and what success looks like..."
              rows={5}
              className={`w-full bg-white/5 border ${errors.projectDetails ? "border-red-400" : "border-white/20"} rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors resize-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.projectDetails ? (
                <p className="text-red-400 text-xs">{errors.projectDetails}</p>
              ) : (
                <span />
              )}
              <span className={`text-xs ${formData.projectDetails.trim().length >= 50 ? "text-[#03FF00]/60" : "text-white/30"}`}>
                {formData.projectDetails.trim().length}/50 min
              </span>
            </div>
          </div>

          {/* SMS Consent */}
          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg p-4">
            <input
              type="checkbox"
              id="smsConsent"
              checked={formData.smsConsent}
              onChange={(e) => updateField("smsConsent", e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent accent-[#03FF00]"
            />
            <label htmlFor="smsConsent" className="text-xs text-white/50 leading-relaxed cursor-pointer">
              I agree to receive text messages from Botmakers.ai regarding my project inquiry.
              Message and data rates may apply. Reply STOP to opt out at any time.
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="btn-default border border-white/30 text-white hover:border-[#03FF00] hover:text-[#03FF00]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-default btn-highlighted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Submit Project</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
