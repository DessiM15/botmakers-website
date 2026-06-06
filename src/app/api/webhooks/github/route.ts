// SPEC: SPEC-DEPENDENCY-MAP > Project Management > WEBHOOKS > GitHub
// DEP-MAP: Webhooks > POST /api/webhooks/github
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projectRepos } from "@/lib/db/schema";
import { env } from "@/lib/env";
import crypto from "crypto";

function verifyGitHubSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (env.GITHUB_WEBHOOK_SECRET) {
      if (!verifyGitHubSignature(body, signature, env.GITHUB_WEBHOOK_SECRET)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = request.headers.get("x-github-event");
    const payload = JSON.parse(body);

    if (event === "push" && payload.repository) {
      const repoFullName = payload.repository.full_name as string;
      const [owner, repo] = repoFullName.split("/");

      await db
        .update(projectRepos)
        .set({ lastSyncedAt: new Date() })
        .where(
          eq(projectRepos.githubUrl, `https://github.com/${owner}/${repo}`)
        );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/webhooks/github] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
