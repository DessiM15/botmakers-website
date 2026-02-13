"use client";

import { useState } from "react";
import Image from "next/image";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/portal/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "We couldn't find an account with that email. Contact info@botmakers.ai."
        );
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/botmakers-full-logo.png"
            alt="Botmakers.ai"
            width={180}
            height={40}
            className="mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-[#033457]">Client Portal</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your project progress, view demos, and ask questions.
          </p>
        </div>

        {sent ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#033457] mb-2">
              Check your email
            </h2>
            <p className="text-gray-500 text-sm">
              We sent a login link to <strong>{email}</strong>. Click the link
              to access your portal.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-4 text-sm text-[#033457] hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
          >
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#033457]/20 focus:border-[#033457] transition-colors"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[#033457] text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#022a47] transition-colors"
            >
              {loading ? "Sending..." : "Send Login Link"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">
          Don&apos;t have access?{" "}
          <a href="mailto:info@botmakers.ai" className="text-[#033457] hover:underline">
            Contact info@botmakers.ai
          </a>
        </p>
      </div>
    </div>
  );
}
