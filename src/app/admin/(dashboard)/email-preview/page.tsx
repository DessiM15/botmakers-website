"use client";

import { useState, useMemo } from "react";

const CAL_LINK = "https://cal.com/botmakers/30min";
const SITE_URL = "https://www.botmakers.ai";
const LOGO_BASE64 = "data:image/png;base64,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";

const DEFAULT_BODY = `It's been a little while since we connected, and I wanted to check in.

At Botmakers.ai, we've been building some exciting new AI solutions for businesses and I thought you might be interested in what's new.

We now deliver working MVPs within one week — so you can see real results before committing to a full build. Whether it's process automation, custom AI tools, or data-driven insights, we'd love to explore how we can help.`;

const DEFAULT_FEEDBACK = `I'd also love your perspective — what tools, services, or solutions would be most valuable to you and your industry right now? Your feedback helps us build better products.`;

const DEFAULT_CLOSING = `If now isn't the right time, no worries — just reply and let me know. I'd love to stay in touch either way.`;

interface EmailFields {
  recipientName: string;
  subject: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  feedbackParagraph: string;
  showReferralSection: boolean;
  referralLink: string;
  closingText: string;
  senderName: string;
  senderTitle: string;
}

function buildHTML(fields: EmailFields): string {
  const firstName = fields.recipientName.split(" ")[0] || "there";

  const bodyParagraphs = fields.body
    .split("\n\n")
    .filter((p) => p.trim())
    .map(
      (p) =>
        `<tr><td style="color:#333333;font-size:16px;line-height:1.6;padding:0 0 16px 0;font-family:Arial,sans-serif;">${p.replace(/\n/g, "<br/>")}</td></tr>`
    )
    .join("\n");

  const feedbackHTML = fields.feedbackParagraph.trim()
    ? `<tr><td style="color:#333333;font-size:16px;line-height:1.6;padding:0 0 16px 0;font-family:Arial,sans-serif;">${fields.feedbackParagraph.replace(/\n/g, "<br/>")}</td></tr>`
    : "";

  const referralHTML = fields.showReferralSection
    ? `<tr><td style="padding:24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid #033457;border-collapse:collapse;">
          <tr><td bgcolor="#f0f7ff" style="background-color:#f0f7ff;padding:20px;font-family:Arial,sans-serif;">
            <p style="margin:0 0 12px;color:#033457;font-weight:bold;font-size:16px;">Know someone who could benefit?</p>
            <p style="margin:0 0 12px;color:#333333;font-size:14px;line-height:1.5;">If you know any colleagues or businesses that could use AI-powered solutions, we'd love an introduction. You can fill out a quick referral form:</p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0;"><tr><td bgcolor="#033457" style="background-color:#033457;border-radius:6px;padding:10px 24px;">
              <a href="${fields.referralLink}" style="color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;">Share a Referral &#8594;</a>
            </td></tr></table>
            <p style="margin:0;color:#666666;font-size:13px;line-height:1.5;">Or simply <strong>reply to this email</strong> with their name and email, and we'll take it from there.</p>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  const closingHTML = fields.closingText.trim()
    ? `<tr><td style="color:#666666;font-size:14px;line-height:1.6;padding:24px 0 0 0;font-family:Arial,sans-serif;">${fields.closingText.replace(/\n/g, "<br/>")}</td></tr>`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fields.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" style="background-color:#f5f5f5;">
    <tr><td align="center" style="padding:20px 0;">

      <!-- Email container -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td bgcolor="#033457" style="background-color:#033457;padding:32px;text-align:center;">
          <img src="${LOGO_BASE64}" alt="Botmakers.ai" height="32" style="height:32px;display:inline-block;" />
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <!-- Greeting -->
            <tr><td style="color:#333333;font-size:16px;line-height:1.6;padding:0 0 16px 0;font-family:Arial,sans-serif;">Hi ${firstName},</td></tr>

            <!-- Body paragraphs -->
            ${bodyParagraphs}

            <!-- CTA Button -->
            <tr><td align="center" style="padding:32px 0;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td bgcolor="#03FF00" style="background-color:#03FF00;border-radius:8px;padding:14px 32px;" align="center">
                  <a href="${fields.ctaUrl}" style="color:#033457;font-size:15px;font-weight:bold;text-decoration:none;display:inline-block;font-family:Arial,sans-serif;">${fields.ctaText}</a>
                </td>
              </tr></table>
            </td></tr>

            <!-- Feedback -->
            ${feedbackHTML}

            <!-- Referral section -->
            ${referralHTML}

            <!-- Closing -->
            ${closingHTML}

            <!-- Signature -->
            <tr><td style="color:#333333;padding:24px 0 0 0;line-height:1.6;font-family:Arial,sans-serif;">
              Best,<br/>
              <strong>${fields.senderName}</strong><br/>
              <span style="color:#666666;font-size:14px;">${fields.senderTitle}</span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td bgcolor="#033457" style="background-color:#033457;padding:20px 32px;text-align:center;">
          <p style="color:#ffffff;opacity:0.5;font-size:12px;margin:0;font-family:Arial,sans-serif;line-height:1.6;">
            Botmakers.ai &#8212; A Division of BioQuest, Inc.<br/>
            24285 Katy Freeway, Suite 300, Katy, TX 77494<br/>
            866-753-8002 | info@botmakers.ai
          </p>
        </td></tr>

      </table>
      <!-- /Email container -->

    </td></tr>
  </table>
</body>
</html>`;
}

function buildPlainText(fields: EmailFields): string {
  const firstName = fields.recipientName.split(" ")[0] || "there";

  let text = `Hi ${firstName},\n\n${fields.body}\n\n${fields.ctaText}: ${fields.ctaUrl}`;

  if (fields.feedbackParagraph.trim()) {
    text += `\n\n${fields.feedbackParagraph}`;
  }

  if (fields.showReferralSection) {
    text += `\n\nKnow someone who could benefit from AI-powered solutions? Share a referral here: ${fields.referralLink}\n\nOr simply reply to this email with their name and email, and we'll take it from there.`;
  }

  if (fields.closingText.trim()) {
    text += `\n\n${fields.closingText}`;
  }

  text += `\n\nBest,\n${fields.senderName}\n${fields.senderTitle}\n\n---\nBotmakers.ai — A Division of BioQuest, Inc.\n24285 Katy Freeway, Suite 300, Katy, TX 77494\n866-753-8002 | info@botmakers.ai`;

  return text;
}

export default function EmailPreviewPage() {
  const [fields, setFields] = useState<EmailFields>({
    recipientName: "",
    subject: "",
    body: DEFAULT_BODY,
    ctaText: "Book a Quick Call",
    ctaUrl: CAL_LINK,
    feedbackParagraph: DEFAULT_FEEDBACK,
    showReferralSection: true,
    referralLink: `${SITE_URL}/refer`,
    closingText: DEFAULT_CLOSING,
    senderName: "Dee",
    senderTitle: "Botmakers.ai Team",
  });

  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<"html" | "text" | "subject" | null>(null);

  const update = (partial: Partial<EmailFields>) =>
    setFields((prev) => ({ ...prev, ...partial }));

  const startEditing = () => {
    if (!fields.recipientName.trim()) return;
    const firstName = fields.recipientName.split(" ")[0];
    if (!fields.subject) {
      update({
        subject: `${firstName}, let's reconnect — quick update from Botmakers.ai`,
      });
    }
    setEditing(true);
  };

  const htmlOutput = useMemo(
    () => (editing ? buildHTML(fields) : ""),
    [editing, fields]
  );

  const textOutput = useMemo(
    () => (editing ? buildPlainText(fields) : ""),
    [editing, fields]
  );

  const copyToClipboard = async (
    content: string,
    type: "html" | "text" | "subject"
  ) => {
    if (type === "html") {
      // Copy as rich text so email clients render it properly
      const blob = new Blob([content], { type: "text/html" });
      const plainBlob = new Blob([content], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": plainBlob,
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(content);
    }
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors";
  const labelClass = "block text-sm font-medium text-white/70 mb-1.5";

  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Reactivation Email Generator</h1>
        <p className="text-white/50 mb-8">
          Generate and customize reactivation emails for prospects. Edit any
          section and see a live preview.
        </p>

        {/* Step 1: Recipient */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Recipient</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>
                Recipient Name <span className="text-[#03FF00]">*</span>
              </label>
              <input
                type="text"
                value={fields.recipientName}
                onChange={(e) => update({ recipientName: e.target.value })}
                placeholder="John Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Subject Line{" "}
                <span className="text-white/30 text-xs">(auto-generated, editable)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fields.subject}
                  onChange={(e) => update({ subject: e.target.value })}
                  placeholder="Generated after clicking Start"
                  className={`${inputClass} flex-1`}
                />
                {fields.subject && (
                  <button
                    onClick={() => copyToClipboard(fields.subject, "subject")}
                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {copied === "subject" ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              disabled={!fields.recipientName.trim()}
              className="bg-[#03FF00] text-[#033457] px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02dd00] transition-colors"
            >
              Generate &amp; Edit Email
            </button>
          )}
        </div>

        {editing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Edit Content</h2>

              {/* Body */}
              <div>
                <label className={labelClass}>Email Body</label>
                <textarea
                  value={fields.body}
                  onChange={(e) => update({ body: e.target.value })}
                  rows={8}
                  className={`${inputClass} resize-y`}
                />
                <p className="text-white/30 text-xs mt-1">
                  Separate paragraphs with a blank line
                </p>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>CTA Button Text</label>
                  <input
                    type="text"
                    value={fields.ctaText}
                    onChange={(e) => update({ ctaText: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CTA Button URL</label>
                  <input
                    type="text"
                    value={fields.ctaUrl}
                    onChange={(e) => update({ ctaUrl: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Feedback paragraph */}
              <div>
                <label className={labelClass}>
                  Feedback Question{" "}
                  <span className="text-white/30 text-xs">
                    (leave empty to remove)
                  </span>
                </label>
                <textarea
                  value={fields.feedbackParagraph}
                  onChange={(e) =>
                    update({ feedbackParagraph: e.target.value })
                  }
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Referral toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    update({
                      showReferralSection: !fields.showReferralSection,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    fields.showReferralSection
                      ? "bg-[#03FF00]"
                      : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      fields.showReferralSection
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm text-white/70">
                  Include referral section
                </span>
              </div>

              {fields.showReferralSection && (
                <div>
                  <label className={labelClass}>Referral Link</label>
                  <input
                    type="text"
                    value={fields.referralLink}
                    onChange={(e) => update({ referralLink: e.target.value })}
                    className={inputClass}
                  />
                </div>
              )}

              {/* Closing */}
              <div>
                <label className={labelClass}>
                  Closing Text{" "}
                  <span className="text-white/30 text-xs">
                    (leave empty to remove)
                  </span>
                </label>
                <textarea
                  value={fields.closingText}
                  onChange={(e) => update({ closingText: e.target.value })}
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Sender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Sender Name</label>
                  <input
                    type="text"
                    value={fields.senderName}
                    onChange={(e) => update({ senderName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sender Title</label>
                  <input
                    type="text"
                    value={fields.senderTitle}
                    onChange={(e) => update({ senderTitle: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  update({
                    body: DEFAULT_BODY,
                    ctaText: "Book a Quick Call",
                    ctaUrl: CAL_LINK,
                    feedbackParagraph: DEFAULT_FEEDBACK,
                    showReferralSection: true,
                    referralLink: `${SITE_URL}/refer`,
                    closingText: DEFAULT_CLOSING,
                    senderName: "Dee",
                    senderTitle: "Botmakers.ai Team",
                  });
                }}
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Reset to defaults
              </button>
            </div>

            {/* Right: Live Preview + Copy */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(htmlOutput, "html")}
                    className="text-sm bg-[#03FF00]/20 text-[#03FF00] hover:bg-[#03FF00]/30 px-4 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    {copied === "html" ? "Copied!" : "Paste into Email"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(textOutput, "text")}
                    className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {copied === "text" ? "Copied!" : "Copy Plain Text"}
                  </button>
                </div>
              </div>

              {/* HTML Preview */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              </div>

              {/* Plain Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white/50">
                    Plain Text Version
                  </h3>
                </div>
                <pre className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-white/70 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {textOutput}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
