// SPEC: SPEC-PAGES > Admin sidebar — nav items + user info + logout
"use client";

import {
  LayoutDashboard,
  Users,
  UserCheck,
  Kanban,
  FolderOpen,
  FileText,
  Receipt,
  Settings,
  Activity,
  Gift,
  Calendar,
  Home,
} from "lucide-react";
import { NavLink } from "./nav-link";
import { logoutTeam } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import type { TeamUser } from "@/lib/types";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/clients", label: "Clients", icon: UserCheck },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/proposals", label: "Proposals", icon: FileText },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/referrals", label: "Referrals", icon: Gift },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface SidebarNavProps {
  user: TeamUser;
}

export function SidebarNav({ user }: SidebarNavProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-4">
        <h1 className="text-lg font-bold text-[#03FF00]">Botmakers</h1>
        <p className="text-xs text-gray-400">CRM</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="mb-2">
          <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
        <form action={logoutTeam}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
          >
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
