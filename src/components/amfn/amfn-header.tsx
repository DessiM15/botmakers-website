import Image from "next/image";
import { LogOut } from "lucide-react";

export function AmfnHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#0f1729]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image
              src="/amfn/american-fusion-logo.png"
              alt="American Fusion"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            American Fusion Inc.
          </span>
        </div>

        <a
          href="/api/amfn/logout"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </a>
      </div>
    </header>
  );
}
