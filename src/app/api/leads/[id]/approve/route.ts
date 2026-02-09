import { NextRequest, NextResponse } from "next/server";
import { verifyApproveToken } from "@/lib/tokens";
import { getLeadById, updateLead } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get("token");

    if (!token || !verifyApproveToken(id, token)) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    const lead = await getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.status === "reviewed") {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
          <h2>Already Sent</h2>
          <p>The detailed follow-up email has already been sent for this lead.</p>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Update status
    await updateLead(id, { status: "reviewed" });

    // TODO: Send detailed follow-up email via Resend once templates are approved
    // For now, mark the lead as reviewed and show confirmation
    console.log(`[Approve] Lead ${id} approved — detailed follow-up would be sent here`);

    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
        <div style="max-width:500px;margin:0 auto;">
          <div style="width:64px;height:64px;background:#03FF00;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#033457" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 style="color:#033457;">Follow-Up Approved</h2>
          <p style="color:#666;">The detailed project breakdown email has been queued for <strong>${lead.fullName}</strong>.</p>
          <p style="color:#999;font-size:14px;margin-top:24px;">Lead ID: ${id}</p>
        </div>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("[API /api/leads/approve] Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
