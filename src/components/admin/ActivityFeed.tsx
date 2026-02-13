"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Share2, FolderKanban, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "new_lead" | "referral" | "project_update" | "lead_converted";
  title: string;
  detail: string;
  time: string;
  link?: string;
}

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

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_lead: { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-500/10" },
  referral: {
    icon: Share2,
    color: "text-[#03FF00]",
    bg: "bg-[#03FF00]/10",
  },
  project_update: {
    icon: FolderKanban,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  lead_converted: {
    icon: UserPlus,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build activity from recent leads
    fetch("/api/admin/leads?limit=5")
      .then((r) => r.json())
      .then((data) => {
        const items: ActivityItem[] = (data.leads || []).map(
          (lead: {
            id: string;
            name: string;
            company: string;
            source: string;
            status: string;
            created_at: string;
          }) => {
            if (lead.status === "converted") {
              return {
                id: `conv-${lead.id}`,
                type: "lead_converted" as const,
                title: `${lead.name} converted to project`,
                detail: lead.company,
                time: lead.created_at,
                link: `/admin/leads/${lead.id}`,
              };
            }
            return {
              id: lead.id,
              type:
                lead.source === "referral"
                  ? ("referral" as const)
                  : ("new_lead" as const),
              title: `New lead: ${lead.name}`,
              detail: lead.company,
              time: lead.created_at,
              link: `/admin/leads/${lead.id}`,
            };
          }
        );
        setActivities(items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-white/10 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-40 mb-1" />
              <div className="h-3 bg-white/5 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto mb-2 text-white/20" size={24} />
        <p className="text-white/30 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((item) => {
        const config = typeConfig[item.type] || typeConfig.new_lead;
        const Icon = config.icon;
        const content = (
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
            <div
              className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}
            >
              <Icon size={14} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{item.title}</p>
              <p className="text-xs text-white/30">{item.detail}</p>
            </div>
            <span className="text-xs text-white/20 flex-shrink-0">
              {relativeTime(item.time)}
            </span>
          </div>
        );

        return item.link ? (
          <Link key={item.id} href={item.link}>
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}
