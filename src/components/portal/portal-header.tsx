// SPEC: SPEC-PAGES > Portal header — logo, client name, nav, logout
import Link from "next/link";
import { logoutClient } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/types";

interface PortalHeaderProps {
  client: Client;
}

export function PortalHeader({ client }: PortalHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#033457]">Botmakers</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Client Portal
            </span>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex" aria-label="Portal navigation">
            <Link
              href="/portal"
              className="text-sm text-muted-foreground hover:text-[#033457]"
            >
              Dashboard
            </Link>
            <Link
              href="/portal/invoices"
              className="text-sm text-muted-foreground hover:text-[#033457]"
            >
              Invoices
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground md:inline">
            {client.fullName}
          </span>
          <form action={logoutClient}>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
