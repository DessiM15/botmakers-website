"use client";

import { useState, useMemo } from "react";

const CAL_LINK = "https://cal.com/botmakers/30min";
const SITE_URL = "https://www.botmakers.ai";

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
          <img src="${SITE_URL}/assets/botmakers-white-green-logo.png" alt="Botmakers.ai" height="32" style="height:32px;display:inline-block;" />
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
