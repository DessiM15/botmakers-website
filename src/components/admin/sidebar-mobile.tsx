// SPEC: CLAUDE.md > Mobile responsive: all pages 375px+
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import type { TeamUser } from "@/lib/types";

interface SidebarMobileProps {
  user: TeamUser;
}

export function SidebarMobile({ user }: SidebarMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#033457] px-4 py-3 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <span className="text-lg font-bold text-[#03FF00]">Botmakers</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 bg-[#033457] p-0 border-white/10"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Admin navigation menu
          </SheetDescription>
          <div onClick={() => setOpen(false)}>
            <SidebarNav user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
