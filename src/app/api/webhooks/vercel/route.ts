// SPEC: SPEC-DEPENDENCY-MAP > Project Management > WEBHOOKS > Vercel
// DEP-MAP: Webhooks > POST /api/webhooks/vercel
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projectRepos, projectDemos } from "@/lib/db/schema";
import { env } from "@/lib/env";
import crypto from "crypto";

function verifyVercelSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha1", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-vercel-signature");

    if (env.VERCEL_WEBHOOK_SECRET) {
      if (!verifyVercelSignature(body, signature, env.VERCEL_WEBHOOK_SECRET)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);

    if (payload.type === "deployment.succeeded" || payload.type === "deployment-ready") {
      const url = payload.payload?.deployment?.url
        ?? payload.payload?.url
        ?? payload.url;

      const repoUrl = payload.payload?.deployment?.meta?.githubRepoUrl
        ?? payload.payload?.meta?.githubRepoUrl;

      if (url && repoUrl) {
        const normalizedUrl = repoUrl.replace(/\.git$/, "");
        const [repo] = await db
          .select()
          .from(projectRepos)
          .where(eq(projectRepos.githubUrl, normalizedUrl))
          .limit(1);

        if (repo) {
          await db.insert(projectDemos).values({
            projectId: repo.projectId,
            title: `Vercel Preview — ${new Date().toLocaleDateString()}`,
            url: url.startsWith("http") ? url : `https://${url}`,
            isAutoPulled: true,
            isApproved: false,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/webhooks/vercel] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
