"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, FolderKanban } from "lucide-react";

interface Metrics {
  leadsThisWeek: number;
  leadsLastWeek: number;
  leadsThisMonth: number;
  sourceBreakdown: Record<string, number>;
  activeProjects: number;
  projectsByPhase: Record<string, number>;
}

const sourceLabels: Record<string, string> = {
  web_form: "Web Form",
  referral: "Referral",
  vapi: "VAPI",
};

const sourceColors: Record<string, string> = {
  web_form: "bg-blue-500",
  referral: "bg-[#03FF00]",
  vapi: "bg-purple-500",
};

export default function MetricsCards() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse"
          >
            <div className="h-4 bg-white/10 rounded w-24 mb-3" />
            <div className="h-8 bg-white/10 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const weekTrend = metrics.leadsLastWeek
    ? Math.round(
        ((metrics.leadsThisWeek - metrics.leadsLastWeek) /
          metrics.leadsLastWeek) *
          100
      )
    : 0;
  const weekUp = weekTrend >= 0;

  const sourceTotal = Object.values(metrics.sourceBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Leads This Week */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            Leads This Week
          </p>
          <Users size={16} className="text-white/20" />
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-white">
            {metrics.leadsThisWeek}
          </p>
          <div
            className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              weekUp ? "text-[#03FF00]" : "text-red-400"
            }`}
          >
            {weekUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(weekTrend)}%
          </div>
        </div>
        <p className="text-xs text-white/30 mt-1">
          vs {metrics.leadsLastWeek} last week
        </p>
      </div>

      {/* Leads This Month */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            Leads This Month
          </p>
          <Users size={16} className="text-white/20" />
        </div>
        <p className="text-3xl font-bold text-white">
          {metrics.leadsThisMonth}
        </p>
        <p className="text-xs text-white/30 mt-1">total submissions</p>
      </div>

      {/* Source Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">
          Lead Sources
        </p>
        {sourceTotal > 0 && (
          <>
            <div className="flex rounded-full overflow-hidden h-2 mb-3">
              {Object.entries(metrics.sourceBreakdown).map(([key, val]) => (
                <div
                  key={key}
                  className={`${sourceColors[key] || "bg-gray-500"}`}
                  style={{ width: `${(val / sourceTotal) * 100}%` }}
                />
              ))}
            </div>
            <div className="space-y-1">
              {Object.entries(metrics.sourceBreakdown).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        sourceColors[key] || "bg-gray-500"
                      }`}
                    />
                    <span className="text-white/50">
                      {sourceLabels[key] || key}
                    </span>
                  </div>
                  <span className="text-white/70 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Active Projects */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            Active Projects
          </p>
          <FolderKanban size={16} className="text-white/20" />
        </div>
        <p className="text-3xl font-bold text-white">
          {metrics.activeProjects}
        </p>
        <div className="mt-2 space-y-1">
          {Object.entries(metrics.projectsByPhase).map(([phase, count]) => (
            <div
              key={phase}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-white/40">{phase}</span>
              <span className="text-white/60 font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
