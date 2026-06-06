// SPEC: CLAUDE.md > Custom error page
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#033457] px-4">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-[#03FF00]">Oops</div>
        <h1 className="text-2xl font-semibold text-white">
          Something went wrong
        </h1>
        <p className="text-gray-300 max-w-md mx-auto">
          An unexpected error occurred. Please try again or contact us if the
          problem persists.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 transition-colors rounded-lg"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium border border-white/20 text-white hover:bg-white/10 transition-colors rounded-lg"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
