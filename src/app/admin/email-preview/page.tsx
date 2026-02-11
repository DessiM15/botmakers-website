"use client";

import { useState } from "react";

export default function EmailPreviewPage() {
  const [recipientName, setRecipientName] = useState("");
  const [referrerSlug, setReferrerSlug] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [copied, setCopied] = useState<"html" | "text" | null>(null);

  const generateTemplates = async () => {
    if (!recipientName.trim()) return;
    const res = await fetch(
      `/api/admin/email-preview?name=${encodeURIComponent(recipientName.trim())}&slug=${encodeURIComponent(referrerSlug.trim())}`
    );
    const data = await res.json();
    setHtmlOutput(data.html);
    setTextOutput(data.text);
  };

  const copyToClipboard = async (content: string, type: "html" | "text") => {
    await navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Reactivation Email Generator</h1>
        <p className="text-white/50 mb-8">
          Generate personalized reactivation emails to send to old prospects.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Recipient Name <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Smith"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Referrer Slug <span className="text-white/30 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={referrerSlug}
                onChange={(e) => setReferrerSlug(e.target.value)}
                placeholder="john-smith"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
              />
              <p className="text-white/30 text-xs mt-1">
                Used for the ?from= referral link (e.g., john-smith)
              </p>
            </div>
          </div>
          <button
            onClick={generateTemplates}
            disabled={!recipientName.trim()}
            className="bg-[#03FF00] text-[#033457] px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02dd00] transition-colors"
          >
            Generate Email
          </button>
        </div>

        {htmlOutput && (
          <div className="space-y-8">
            {/* HTML Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">HTML Email Preview</h2>
                <button
                  onClick={() => copyToClipboard(htmlOutput, "html")}
                  className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors"
                >
                  {copied === "html" ? "Copied!" : "Copy HTML"}
                </button>
              </div>
              <div
                className="bg-white rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>

            {/* Plain Text */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Plain Text Version</h2>
                <button
                  onClick={() => copyToClipboard(textOutput, "text")}
                  className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors"
                >
                  {copied === "text" ? "Copied!" : "Copy Text"}
                </button>
              </div>
              <pre className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/70 whitespace-pre-wrap">
                {textOutput}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
