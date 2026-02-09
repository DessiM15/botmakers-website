// Simple signed token for approve links in emails.
// Uses HMAC-SHA256 with a secret to generate and verify tokens.

import { createHmac } from "crypto";

const SECRET = process.env.APPROVE_TOKEN_SECRET || "botmakers-dev-secret-change-in-production";

export function generateApproveToken(leadId: string): string {
  const hmac = createHmac("sha256", SECRET);
  hmac.update(leadId);
  return hmac.digest("hex");
}

export function verifyApproveToken(leadId: string, token: string): boolean {
  const expected = generateApproveToken(leadId);
  return token === expected;
}
