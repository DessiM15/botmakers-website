// SPEC: SPEC-PAGES > PUBLIC PAGES > Layout
// Redesigned public layout — scroll-aware nav, 4-column footer
import Link from "next/link";
import { PublicNav } from "@/components/shared/public-nav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Scroll-aware navigation */}
      <PublicNav />

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#033457] text-white py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded bg-[#03FF00] flex items-center justify-center">
                  <span className="text-[#033457] font-bold text-sm">B</span>
                </div>
                <span className="text-lg font-semibold">Botmakers</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                AI-accelerated software development. Custom platforms, AI
                integrations, and automation — built by BotMakers Inc. from
                Katy, Texas.
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold mb-5 tracking-wide uppercase text-[#03FF00]">
                Company
              </h4>
              <div className="space-y-3 text-sm text-gray-400">
                <Link
                  href="/about"
                  className="block hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/news"
                  className="block hover:text-white transition-colors"
                >
                  News
                </Link>
                <Link
                  href="/partners"
                  className="block hover:text-white transition-colors"
                >
                  Partners
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold mb-5 tracking-wide uppercase text-[#03FF00]">
                Resources
              </h4>
              <div className="space-y-3 text-sm text-gray-400">
                <Link
                  href="/investors"
                  className="block hover:text-white transition-colors"
                >
                  Investors
                </Link>
                <Link
                  href="/refer"
                  className="block hover:text-white transition-colors"
                >
                  Refer
                </Link>
                <Link
                  href="/portal/login"
                  className="block hover:text-white transition-colors"
                >
                  Client Portal
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold mb-5 tracking-wide uppercase text-[#03FF00]">
                Contact
              </h4>
              <div className="space-y-3 text-sm text-gray-400">
                <p>Katy, Texas</p>
                <a
                  href="mailto:info@botmakers.ai"
                  className="block hover:text-white transition-colors"
                >
                  info@botmakers.ai
                </a>
                <Link
                  href="/contact"
                  className="block hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} BotMakers Inc. All rights
              reserved.
            </p>
            <Link
              href="/admin/login"
              className="hover:text-gray-300 transition-colors"
            >
              Team Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
