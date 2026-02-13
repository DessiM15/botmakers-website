"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Brain,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  ArrowRightLeft,
  Save,
} from "lucide-react";

interface AIAnalysis {
  leadScore: string;
  projectSummary: string;
  complexityAssessment: { level: string; reasoning: string };
  estimatedEffort: string;
  keyQuestions: string[];
  redFlags: string[];
  recommendedNextStep: string;
}

interface LeadDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  project_type: string;
  project_timeline: string;
  existing_systems: string;
  referral_source: string;
  preferred_contact: string;
  project_details: string;
  sms_consent: boolean;
  lead_score: string;
  status: string;
  source: string;
  ai_internal_analysis: AIAnalysis | null;
  ai_prospect_summary: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  contacted: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  qualified: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  processed: "bg-white/10 text-white/50 border-white/20",
  converted: "bg-[#03FF00]/10 text-[#03FF00] border-[#03FF00]/30",
  closed: "bg-red-500/10 text-red-400 border-red-500/30",
};

const scoreColors: Record<string, string> = {
  High: "text-[#03FF00]",
  Medium: "text-yellow-400",
  Low: "text-white/40",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data);
        setNotes(data.notes || "");
        setStatus(data.status || "pending");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!lead) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: lead.full_name,
          client_email: lead.email,
          client_company: lead.company_name,
          client_phone: lead.phone,
          project_type: lead.project_type,
        }),
      });
      const data = await res.json();
      if (data.projectId) {
        setStatus("converted");
        router.push(`/admin/projects/${data.projectId}`);
      }
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Lead not found.</p>
        <Link
          href="/admin/leads"
          className="text-[#03FF00] text-sm mt-2 inline-block hover:underline"
        >
          Back to leads
        </Link>
      </div>
    );
  }

  const ai = lead.ai_internal_analysis;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back nav */}
      <Link
        href="/admin/leads"
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.full_name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <Mail size={13} /> {lead.email}
            </span>
            {lead.phone && (
              <span className="flex items-center gap-1">
                <Phone size={13} /> {lead.phone}
              </span>
            )}
            {lead.company_name && (
              <span className="flex items-center gap-1">
                <Building2 size={13} /> {lead.company_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${
              scoreColors[lead.lead_score] || "text-white/40"
            }`}
          >
            {lead.lead_score} Score
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${
              statusColors[status] || "bg-white/10 text-white/50 border-white/20"
            }`}
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="processed">Processed</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submission Details */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Submission Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/30 text-xs mb-1">Project Type</p>
                <p className="text-white/80">{lead.project_type || "—"}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1">Timeline</p>
                <p className="text-white/80">
                  {lead.project_timeline || "—"}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1">Existing Systems</p>
                <p className="text-white/80">
                  {lead.existing_systems || "—"}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1">How They Found Us</p>
                <p className="text-white/80">
                  {lead.referral_source || "—"}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1">
                  Preferred Contact Method
                </p>
                <p className="text-white/80">
                  {lead.preferred_contact || "—"}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-1">SMS Consent</p>
                <p className="text-white/80">
                  {lead.sms_consent ? "Yes" : "No"}
                </p>
              </div>
            </div>
            {lead.project_details && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-white/30 text-xs mb-2">Project Details</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {lead.project_details}
                </p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {ai && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={16} className="text-purple-400" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  AI Analysis
                </h2>
              </div>

              {/* Summary */}
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                {ai.projectSummary}
              </p>

              {/* Complexity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/30 text-xs mb-1">Complexity</p>
                  <p className="text-white/80 text-sm font-medium">
                    {ai.complexityAssessment.level}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {ai.complexityAssessment.reasoning}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/30 text-xs mb-1">
                    Estimated Effort
                  </p>
                  <p className="text-white/80 text-sm font-medium">
                    {ai.estimatedEffort}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {ai.recommendedNextStep}
                  </p>
                </div>
              </div>

              {/* Key Questions */}
              {ai.keyQuestions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare size={13} className="text-blue-400" />
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                      Key Questions to Ask
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {ai.keyQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="text-sm text-white/60 flex items-start gap-2"
                      >
                        <span className="text-blue-400 mt-0.5 text-xs">
                          {i + 1}.
                        </span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags */}
              {ai.redFlags.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={13} className="text-red-400" />
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                      Red Flags
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {ai.redFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-sm text-red-300/70 flex items-start gap-2"
                      >
                        <span className="text-red-400 mt-0.5">&bull;</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* AI Prospect Summary */}
          {lead.ai_prospect_summary && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#03FF00]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  AI Prospect Summary
                </h2>
              </div>
              <p className="text-white/60 text-sm italic leading-relaxed">
                &ldquo;{lead.ai_prospect_summary}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Calendar size={13} />
                <span>Received {formatDate(lead.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Clock size={13} />
                <span>Updated {formatDate(lead.updated_at)}</span>
              </div>
              <div className="text-white/40 text-xs">
                Source:{" "}
                <span className="text-white/60 capitalize">
                  {lead.source?.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Add internal notes..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#03FF00]/50 resize-none"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Convert to Project */}
          {status !== "converted" && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Actions
              </h3>
              <button
                onClick={handleConvert}
                disabled={converting}
                className="w-full flex items-center justify-center gap-2 bg-[#03FF00]/10 hover:bg-[#03FF00]/20 text-[#03FF00] text-sm font-medium rounded-lg py-2.5 transition-colors border border-[#03FF00]/30 disabled:opacity-50"
              >
                <ArrowRightLeft size={14} />
                {converting ? "Converting..." : "Convert to Project"}
              </button>
              <p className="text-xs text-white/20 mt-2 text-center">
                Creates a new project with this lead&apos;s info
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
