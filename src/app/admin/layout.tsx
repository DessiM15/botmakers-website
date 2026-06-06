// SPEC: SPEC-PAGES > /admin layout — dark theme, sidebar
import { requireTeam } from "@/lib/auth/helpers";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { SidebarMobile } from "@/components/admin/sidebar-mobile";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireTeam();

  return (
    <div className="flex min-h-screen bg-[#033457]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/10">
        <SidebarNav user={user} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <SidebarMobile user={user} />
        <main className="flex-1 overflow-y-auto p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
