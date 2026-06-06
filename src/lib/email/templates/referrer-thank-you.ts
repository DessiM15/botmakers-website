// SPEC: SPEC-WORKFLOWS > Workflow 2 > Step 5: Referrer thank you email
// DEP-MAP: Referral > EMAIL > referrerThankYou

interface ReferrerThankYouData {
  fullName: string;
  referredNames: string[];
}

export function referrerThankYou(referrer: ReferrerThankYouData): {
  subject: string;
  html: string;
} {
  const firstName = referrer.fullName.split(" ")[0];
  const referredList = referrer.referredNames
    .map((n) => `<li style="padding:4px 0">${n}</li>`)
    .join("");

  return {
    subject: "Thanks for the referral! — Botmakers.ai",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;color:#03FF00;font-size:24px;font-weight:700">Botmakers.ai</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <h2 style="margin:0 0 16px;font-size:20px;color:#18181b">Thanks, ${firstName}!</h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46">
      We really appreciate you referring people our way. Word-of-mouth is the best compliment we can receive.
    </p>
    <div style="margin:20px 0;padding:16px;background:#f9fafb;border-radius:6px">
      <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">You referred:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#18181b">${referredList}</ul>
    </div>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#3f3f46">
      We&apos;ll reach out to them shortly. If any of your referrals become clients, we&apos;ll make sure to thank you properly.
    </p>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers Inc. — <a href="https://botmakers.ai" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
