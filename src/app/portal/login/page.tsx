// SPEC: SPEC-PAGES > /portal/login
// Portal login page — light theme (gray-50 bg), centered card
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicLinkForm } from "@/components/portal/magic-link-form";

export const metadata = {
  title: "Client Portal — Botmakers",
};

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#033457]">Client Portal</CardTitle>
          <CardDescription>
            Enter your email to receive a login link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MagicLinkForm />
        </CardContent>
      </Card>
    </div>
  );
}
