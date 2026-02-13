"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Mail, Phone, Building2, Share2 } from "lucide-react";

interface ReferredContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
}

interface Referrer {
  id: string;
  full_name: string;
  email: string;
  company: string;
  feedback: string | null;
  total_referrals: number;
  created_at: string;
  referrals: ReferredContact[];
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ReferralsPage() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/referrals")
      .then((r) => r.json())
      .then((data) => setReferrers(data.referrers || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Referrals</h1>
        <p className="text-white/50 text-sm mt-1">
          {referrers.length} referrer{referrers.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse"
            >
              <div className="h-5 bg-white/10 rounded w-48 mb-3" />
              <div className="h-4 bg-white/5 rounded w-32" />
            </div>
          ))}
        </div>
      ) : referrers.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Share2 className="mx-auto mb-3 text-white/20" size={32} />
          <p className="text-white/40">No referrals yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrers.map((referrer) => (
            <div
              key={referrer.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Referrer header */}
              <button
                onClick={() => toggleExpand(referrer.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="text-white/40">
                  {expanded.has(referrer.id) ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-medium">
                      {referrer.full_name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#03FF00]/10 text-[#03FF00] font-bold">
                      {referrer.total_referrals} referral
                      {referrer.total_referrals !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {referrer.email}
                    </span>
                    {referrer.company && (
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {referrer.company}
                      </span>
                    )}
                    <span>{relativeTime(referrer.created_at)}</span>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {expanded.has(referrer.id) && (
                <div className="border-t border-white/5 px-5 pb-5">
                  {/* Feedback */}
                  {referrer.feedback && (
                    <div className="mt-4 mb-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">
                        Industry Feedback
                      </p>
                      <p className="text-sm text-white/70">
                        {referrer.feedback}
                      </p>
                    </div>
                  )}

                  {/* Referred contacts table */}
                  <div className="mt-3">
                    <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                      Referred Contacts
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-white/40 text-xs uppercase tracking-wider">
                            <th className="text-left pb-2 pr-4">Name</th>
                            <th className="text-left pb-2 pr-4">Email</th>
                            <th className="text-left pb-2 pr-4">Phone</th>
                            <th className="text-left pb-2 pr-4">Company</th>
                            <th className="text-left pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrer.referrals.map((ref, i) => (
                            <tr
                              key={i}
                              className="border-t border-white/5 text-white/60"
                            >
                              <td className="py-2 pr-4">{ref.name}</td>
                              <td className="py-2 pr-4">{ref.email}</td>
                              <td className="py-2 pr-4">
                                {ref.phone || "—"}
                              </td>
                              <td className="py-2 pr-4">
                                {ref.company || "—"}
                              </td>
                              <td className="py-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                                  {ref.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
