// Reactivation email plain text template for manual sending by Dee.
// Usage: Import and call getReactivationEmailText("John Smith") to get the text string.

const CAL_LINK = "https://cal.com/botmakers/30min";
const SITE_URL = "https://botmakers.ai";

export function getReactivationEmailText(
  recipientName: string,
  referrerSlug?: string
): string {
  const firstName = recipientName.split(" ")[0];
  const referralLink = referrerSlug
    ? `${SITE_URL}/refer?from=${encodeURIComponent(referrerSlug)}`
    : `${SITE_URL}/refer`;

  return `Hi ${firstName},

It's been a little while since we connected, and I wanted to check in.

At Botmakers.ai, we've been building some exciting new AI solutions for businesses and I thought you might be interested in what's new.

We now deliver working MVPs within one week — so you can see real results before committing to a full build. Whether it's process automation, custom AI tools, or data-driven insights, we'd love to explore how we can help.

Book a quick call: ${CAL_LINK}

I'd also love your perspective — what tools, services, or solutions would be most valuable to you and your industry right now? Your feedback helps us build better products.

Know someone who could benefit from AI-powered solutions? Share a referral here: ${referralLink}

Or simply reply to this email with their name and email, and we'll take it from there.

If now isn't the right time, no worries — just reply and let me know. I'd love to stay in touch either way.

Best,
Dee
Botmakers.ai Team

---
Botmakers.ai — A Division of BioQuest, Inc.
24285 Katy Freeway, Suite 300, Katy, TX 77494
866-753-8002 | info@botmakers.ai`;
}
