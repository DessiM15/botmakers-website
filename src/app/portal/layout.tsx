// SPEC: SPEC-PAGES > /portal layout — light theme, max-w-5xl
import { requireClient } from "@/lib/auth/helpers";
import { PortalHeader } from "@/components/portal/portal-header";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await requireClient();

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader client={client} />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
