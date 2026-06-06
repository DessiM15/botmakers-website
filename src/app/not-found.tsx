// SPEC: CLAUDE.md > Custom 404 page
import Link from "next/link";

export const metadata = {
  title: "Page Not Found — Botmakers.ai",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#033457] px-4">
      <div className="text-center space-y-6">
        <div className="text-8xl font-bold text-[#03FF00]">404</div>
        <h1 className="text-2xl font-semibold text-white">Page Not Found</h1>
        <p className="text-gray-300 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 transition-colors rounded-lg"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
