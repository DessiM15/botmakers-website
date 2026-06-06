// SPEC: SPEC-PAGES > /admin/login
// Admin login page — dark theme (#033457 bg), centered card
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin Login — Botmakers CRM",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#033457] px-4">
      <Card className="w-full max-w-sm border-white/10 bg-[#0a4570] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Botmakers CRM</CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
