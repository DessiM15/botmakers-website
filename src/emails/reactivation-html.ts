// Reactivation email HTML template for manual sending by Dee.
// Usage: Import and call getReactivationEmailHTML("John Smith") to get the HTML string.
// Copy the output and paste into your email client.

const CAL_LINK = "https://cal.com/botmakers/30min";
const SITE_URL = "https://botmakers.ai";

export function getReactivationEmailHTML(
  recipientName: string,
  referrerSlug?: string
): string {
  const firstName = recipientName.split(" ")[0];
  const referralLink = referrerSlug
    ? `${SITE_URL}/refer?from=${encodeURIComponent(referrerSlug)}`
    : `${SITE_URL}/refer`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background: #f5f5f5;">
  <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #033457; padding: 32px; text-align: center;">
      <img src="${SITE_URL}/assets/botmakers-white-green-logo.png" alt="Botmakers.ai" style="height: 32px;" />
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${firstName},</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        It&rsquo;s been a little while since we connected, and I wanted to check in.
        At Botmakers.ai, we&rsquo;ve been building some exciting new AI solutions for businesses
        and I thought you might be interested in what&rsquo;s new.
      </p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        We now deliver working MVPs within one week &mdash; so you can see real results before
        committing to a full build. Whether it&rsquo;s process automation, custom AI tools,
        or data-driven insights, we&rsquo;d love to explore how we can help.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${CAL_LINK}" style="display: inline-block; background: #03FF00; color: #033457; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
          Book a Quick Call
        </a>
      </div>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        I&rsquo;d also love your perspective &mdash; <strong>what tools, services, or solutions would be most
        valuable to you and your industry right now?</strong> Your feedback helps us build better products.
      </p>

      <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #033457; margin: 24px 0;">
        <p style="margin: 0 0 12px; color: #033457; font-weight: 600;">Know someone who could benefit?</p>
        <p style="margin: 0 0 12px; color: #333; font-size: 14px; line-height: 1.5;">
          If you know any colleagues or businesses that could use AI-powered solutions,
          we&rsquo;d love an introduction. It takes just a minute:
        </p>
        <a href="${referralLink}" style="display: inline-block; background: #033457; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Share a Referral &rarr;
        </a>
      </div>

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
        If now isn&rsquo;t the right time, no worries &mdash; just reply and let me know.
        I&rsquo;d love to stay in touch either way.
      </p>

      <p style="color: #333; margin-top: 24px; line-height: 1.6;">
        Best,<br />
        <strong>Dee</strong><br />
        <span style="color: #666; font-size: 14px;">Botmakers.ai Team</span>
      </p>
    </div>
    <div style="background: #033457; padding: 20px 32px; text-align: center;">
      <p style="color: #ffffff80; font-size: 12px; margin: 0;">
        Botmakers.ai &mdash; A Division of BioQuest, Inc.<br />
        24285 Katy Freeway, Suite 300, Katy, TX 77494<br />
        866-753-8002 | info@botmakers.ai
      </p>
    </div>
  </div>
</body>
</html>`;
}
