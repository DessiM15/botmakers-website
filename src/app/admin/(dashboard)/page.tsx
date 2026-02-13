"use client";

import Link from "next/link";
import { Users, Share2, FolderKanban, Plus } from "lucide-react";
import MetricsCards from "@/components/admin/MetricsCards";
import ActivityFeed from "@/components/admin/ActivityFeed";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">
          Overview of your leads, projects, and referrals.
        </p>
      </div>

      {/* Metrics */}
      <MetricsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Recent Activity
          </h2>
          <ActivityFeed />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/leads"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users
                  size={16}
                  className="text-blue-400 group-hover:text-blue-300"
                />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">View Leads</p>
                <p className="text-xs text-white/30">
                  Review and manage incoming leads
                </p>
              </div>
            </Link>
            <Link
              href="/admin/projects/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#03FF00]/10 flex items-center justify-center">
                <Plus
                  size={16}
                  className="text-[#03FF00] group-hover:text-[#03FF00]/80"
                />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">
                  New Project
                </p>
                <p className="text-xs text-white/30">
                  Create a new client project
                </p>
              </div>
            </Link>
            <Link
              href="/admin/referrals"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Share2
                  size={16}
                  className="text-purple-400 group-hover:text-purple-300"
                />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">Referrals</p>
                <p className="text-xs text-white/30">
                  View referrer submissions
                </p>
              </div>
            </Link>
            <Link
              href="/admin/projects"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FolderKanban
                  size={16}
                  className="text-yellow-400 group-hover:text-yellow-300"
                />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">Projects</p>
                <p className="text-xs text-white/30">
                  Manage active projects
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
