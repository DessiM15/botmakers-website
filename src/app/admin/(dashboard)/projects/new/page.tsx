"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPES } from "@/lib/types";

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("lead_id");

  const [form, setForm] = useState({
    name: "",
    client_name: searchParams.get("client_name") || "",
    client_email: searchParams.get("client_email") || "",
    client_company: searchParams.get("client_company") || "",
    client_phone: searchParams.get("client_phone") || "",
    project_type: searchParams.get("project_type") || "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.client_name || !form.client_email || !form.project_type) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, linked_lead_id: leadId }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/admin/projects/${data.id}`);
      } else {
        setError("Failed to create project.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-white/70 mb-1.5";

  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      <h1 className="text-2xl font-bold text-white mb-1">
        Create New Project
      </h1>
      <p className="text-white/50 text-sm mb-8">
        {leadId
          ? "Creating project from lead conversion."
          : "Set up a new project with default phases and milestones."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl bg-white/5 border border-white/10 rounded-xl p-6"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Project Name */}
          <div>
            <label className={labelClass}>
              Project Name <span className="text-[#03FF00]">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., TechFlow AI Assistant"
              className={inputClass}
            />
          </div>

          {/* Client info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Client Name <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="text"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                placeholder="John Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Client Email <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="email"
                name="client_email"
                value={form.client_email}
                onChange={handleChange}
                placeholder="john@company.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Client Company</label>
              <input
                type="text"
                name="client_company"
                value={form.client_company}
                onChange={handleChange}
                placeholder="Company name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Client Phone</label>
              <input
                type="tel"
                name="client_phone"
                value={form.client_phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className={inputClass}
              />
            </div>
          </div>

          {/* Project Type */}
          <div>
            <label className={labelClass}>
              Project Type <span className="text-[#03FF00]">*</span>
            </label>
            <select
              name="project_type"
              value={form.project_type}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select project type...</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Internal notes about this project..."
              rows={4}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#03FF00] text-[#033457] px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02dd00] transition-colors"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
          <Link
            href="/admin/projects"
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-5 bg-white/10 rounded w-32 mb-6" />
          <div className="h-8 bg-white/10 rounded w-48 mb-8" />
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            <div className="h-10 bg-white/5 rounded" />
            <div className="h-10 bg-white/5 rounded" />
          </div>
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
