// SPEC: SPEC-PAGES > PUBLIC PAGES > Layout
// Public pages layout — light theme, shared nav/footer

import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-sm border-b z-50 bg-white/95 border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#033457] flex items-center justify-center">
                <span className="text-[#03FF00] font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-[#033457]">
                Botmakers
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-[#033457] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/refer"
                className="text-sm text-gray-600 hover:text-[#033457] transition-colors"
              >
                Refer Someone
              </Link>
              <Link
                href="/portal/login"
                className="text-sm font-medium text-[#033457] hover:text-[#033457]/80 transition-colors"
              >
                Client Portal
              </Link>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/portal/login"
                className="text-sm font-medium text-[#033457]"
              >
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-[#033457] text-white py-16">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-[#03FF00] flex items-center justify-center">
                  <span className="text-[#033457] font-bold text-sm">B</span>
                </div>
                <span className="text-lg font-semibold">Botmakers</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                AI-accelerated software development company based in Katy,
                Texas. We build custom software that delivers results.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 tracking-wide uppercase text-[#03FF00]">
                Links
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <Link href="/" className="block hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/refer" className="block hover:text-white transition-colors">
                  Refer Someone
                </Link>
                <Link href="/portal/login" className="block hover:text-white transition-colors">
                  Client Portal
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 tracking-wide uppercase text-[#03FF00]">
                Contact
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Katy, Texas</p>
                <a
                  href="mailto:info@botmakers.ai"
                  className="block hover:text-white transition-colors"
                >
                  info@botmakers.ai
                </a>
                <a
                  href="https://botmakers.ai"
                  className="block hover:text-white transition-colors"
                >
                  botmakers.ai
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} BotMakers Inc. All rights reserved.</p>
            <Link
              href="/admin/login"
              className="hover:text-gray-200 transition-colors"
            >
              Team Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
