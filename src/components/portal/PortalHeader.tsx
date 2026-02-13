"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PortalHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    // TODO: Replace with Supabase Auth signOut when connected
    await fetch("/api/portal/auth/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Image
          src="/assets/botmakers-full-logo.png"
          alt="Botmakers.ai"
          width={130}
          height={28}
        />
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
