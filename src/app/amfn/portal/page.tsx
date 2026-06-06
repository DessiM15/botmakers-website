import { redirect } from "next/navigation";
import { isAmfnAuthenticated } from "@/lib/amfn/auth";
import { AmfnHeader } from "@/components/amfn/amfn-header";
import { AmfnFooter } from "@/components/amfn/amfn-footer";
import { AmfnDocumentGrid } from "@/components/amfn/amfn-document-grid";
import { AmfnChatPanel } from "@/components/amfn/amfn-chat-panel";

export default async function AmfnPortalPage() {
  const authenticated = await isAmfnAuthenticated();
  if (!authenticated) {
    redirect("/amfn");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AmfnHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Document Portal
          </h1>
          <p className="text-gray-400">
            Your complete deliverable package from BotMakers Inc. — foundation documents,
            editorial calendar, content, compliance workflows, KPIs, and market intelligence.
          </p>
        </div>
        <AmfnDocumentGrid />
      </main>
      <AmfnFooter />
      <AmfnChatPanel />
    </div>
  );
}
