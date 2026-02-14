"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Share2,
  FolderKanban,
  Mail,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<{
    pendingLeads: number;
    activeProjects: number;
  }>({ pendingLeads: 0, activeProjects: 0 });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics({
            pendingLeads: data.leadsThisWeek || 0,
            activeProjects: data.activeProjects || 0,
          });
        }
      } catch {
        // Silently fail — badges will show 0
      }
    }
    fetchCounts();
  }, []);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Leads",
      href: "/admin/leads",
      icon: Users,
      badge: metrics.pendingLeads,
    },
    { name: "Referrals", href: "/admin/referrals", icon: Share2 },
    {
      name: "Projects",
      href: "/admin/projects",
      icon: FolderKanban,
      badge: metrics.activeProjects,
    },
    { name: "Email Generator", href: "/admin/email-preview", icon: Mail },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // TODO: Replace with Supabase Auth signOut when connected
    document.cookie =
      "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#033457] text-white p-2 rounded-lg border border-white/10"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#033457] border-r border-white/10 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" onClick={() => setIsOpen(false)}>
              <Image
                src="/assets/botmakers-white-green-logo.png"
                alt="Botmakers.ai"
                width={150}
                height={32}
              />
            </Link>
            <p className="text-white/30 text-xs mt-2">Admin Dashboard</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#03FF00]/10 text-[#03FF00]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        active
                          ? "bg-[#03FF00]/20 text-[#03FF00]"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/10 space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors w-full"
            >
              <ExternalLink size={18} />
              <span>View Website</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
