"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Replace with Supabase Auth signInWithPassword when connected
      // For now, mock login for development
      if (!email || !password) {
        setError("Please enter your email and password.");
        setLoading(false);
        return;
      }

      // Mock: accept any @botmakers.ai or @m.botmakers.ai email
      const validDomains = ["botmakers.ai", "m.botmakers.ai"];
      const domain = email.split("@")[1];
      if (!validDomains.includes(domain)) {
        setError("Access denied. Only Botmakers team members can log in.");
        setLoading(false);
        return;
      }

      // Simulate login delay
      await new Promise((r) => setTimeout(r, 500));

      // Store mock session
      document.cookie = "admin_session=mock; path=/; max-age=86400";
      router.push("/admin");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#033457] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/botmakers-white-green-logo.png"
            alt="Botmakers.ai"
            width={180}
            height={40}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">
            Sign in to manage leads, projects, and more.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@botmakers.ai"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#03FF00] text-[#033457] py-3 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02dd00] transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-6">
          Botmakers.ai &mdash; A Division of BioQuest, Inc.
        </p>
      </div>
    </div>
  );
}
