import { redirect } from "next/navigation";
import { isAmfnAuthenticated } from "@/lib/amfn/auth";
import { AmfnLoginForm } from "@/components/amfn/amfn-login-form";
import Image from "next/image";

export default async function AmfnLoginPage() {
  const authenticated = await isAmfnAuthenticated();
  if (authenticated) {
    redirect("/amfn/portal");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and heading */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-20 h-20">
            <Image
              src="/amfn/american-fusion-logo.png"
              alt="American Fusion"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              American Fusion Inc.
            </h1>
            <p className="text-sm text-gray-400">
              Secure Document Portal
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <AmfnLoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600">
          Powered by BotMakers Inc.
        </p>
      </div>
    </div>
  );
}
