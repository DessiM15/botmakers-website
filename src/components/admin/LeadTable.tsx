"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ExternalLink,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  lead_score: string;
  project_type: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  contacted: "bg-blue-500/10 text-blue-400",
  qualified: "bg-purple-500/10 text-purple-400",
  processed: "bg-white/10 text-white/50",
  converted: "bg-[#03FF00]/10 text-[#03FF00]",
  closed: "bg-red-500/10 text-red-400",
};

const scoreColors: Record<string, string> = {
  High: "text-[#03FF00]",
  Medium: "text-yellow-400",
  Low: "text-white/40",
};

const sourceLabels: Record<string, string> = {
  web_form: "Web Form",
  referral: "Referral",
  vapi: "VAPI",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function LeadTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterScore, setFilterScore] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterSource) params.set("source", filterSource);
    if (filterStatus) params.set("status", filterStatus);
    if (filterScore) params.set("score", filterScore);

    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, filterSource, filterStatus, filterScore]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterSource, filterStatus, filterScore]);

  const totalPages = Math.ceil(total / perPage);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch {
      // fail silently
    }
  };

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00]/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            showFilters || filterSource || filterStatus || filterScore
              ? "bg-[#03FF00]/10 text-[#03FF00] border border-[#03FF00]/30"
              : "bg-white/5 text-white/60 border border-white/10 hover:border-white/20"
          }`}
        >
          <Filter size={14} />
          Filters
          {(filterSource || filterStatus || filterScore) && (
            <span className="w-2 h-2 bg-[#03FF00] rounded-full" />
          )}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#03FF00]/50"
          >
            <option value="">All Sources</option>
            <option value="web_form">Web Form</option>
            <option value="referral">Referral</option>
            <option value="vapi">VAPI</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#03FF00]/50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="processed">Processed</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#03FF00]/50"
          >
            <option value="">All Scores</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {(filterSource || filterStatus || filterScore) && (
            <button
              onClick={() => {
                setFilterSource("");
                setFilterStatus("");
                setFilterScore("");
              }}
              className="text-xs text-white/40 hover:text-white/60 px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Company</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Score</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Received</th>
                <th className="text-left p-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td colSpan={7} className="p-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-white/30 text-sm"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-white/30 text-xs">{lead.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-white/60">{lead.company}</td>
                    <td className="p-4">
                      <span className="text-xs text-white/50">
                        {sourceLabels[lead.source] || lead.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-bold ${
                          scoreColors[lead.lead_score] || "text-white/40"
                        }`}
                      >
                        {lead.lead_score}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value)
                        }
                        className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${
                          statusColors[lead.status] || "bg-white/10 text-white/50"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="processed">Processed</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-white/30 text-xs">
                      {relativeTime(lead.created_at)}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-white/30 hover:text-[#03FF00] transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-32 mb-2" />
                <div className="h-4 bg-white/5 rounded w-48" />
              </div>
            ))
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              No leads found.
            </div>
          ) : (
            leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="block p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {lead.name}
                    </p>
                    <p className="text-white/30 text-xs">{lead.company}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      statusColors[lead.status] || "bg-white/10 text-white/50"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                  <span>{sourceLabels[lead.source] || lead.source}</span>
                  <span
                    className={`font-bold ${
                      scoreColors[lead.lead_score] || "text-white/40"
                    }`}
                  >
                    {lead.lead_score}
                  </span>
                  <span className="ml-auto">
                    {relativeTime(lead.created_at)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-white/30">
              {total} total lead{total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-white/50">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
