import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({
      leadsThisWeek: 0, leadsLastWeek: 0, leadsThisMonth: 0,
      sourceBreakdown: { web_form: 0, referral: 0, vapi: 0 },
      activeProjects: 0,
      projectsByPhase: { Discovery: 0, "MVP Build": 0, Revision: 0, Launch: 0 },
    });
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [thisWeekRes, lastWeekRes, thisMonthRes, sourceRes, projectsRes] =
    await Promise.all([
      supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfWeek.toISOString()),
      supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfLastWeek.toISOString())
        .lt("created_at", startOfWeek.toISOString()),
      supabaseAdmin
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
      supabaseAdmin.from("leads").select("source"),
      supabaseAdmin
        .from("projects")
        .select("id, status")
        .in("status", ["draft", "in_progress", "paused"]),
    ]);

  // Source breakdown
  const sourceBreakdown: Record<string, number> = { web_form: 0, referral: 0, vapi: 0 };
  for (const row of sourceRes.data || []) {
    const s = row.source as string;
    if (s in sourceBreakdown) sourceBreakdown[s]++;
  }

  // Projects by phase — get the latest active phase per project
  const projectsByPhase: Record<string, number> = {
    Discovery: 0, "MVP Build": 0, Revision: 0, Launch: 0,
  };
  const activeProjectIds = (projectsRes.data || []).map((p) => p.id);
  if (activeProjectIds.length > 0) {
    const { data: milestones } = await supabaseAdmin
      .from("project_milestones")
      .select("project_id, status, project_phases(name, sort_order)")
      .in("project_id", activeProjectIds)
      .eq("status", "in_progress");

    const projectPhaseMap = new Map<string, string>();
    for (const m of milestones || []) {
      const phase = m.project_phases as unknown as { name: string; sort_order: number } | null;
      if (phase) projectPhaseMap.set(m.project_id, phase.name);
    }
    for (const name of projectPhaseMap.values()) {
      if (name in projectsByPhase) projectsByPhase[name]++;
    }
  }

  return NextResponse.json({
    leadsThisWeek: thisWeekRes.count || 0,
    leadsLastWeek: lastWeekRes.count || 0,
    leadsThisMonth: thisMonthRes.count || 0,
    sourceBreakdown,
    activeProjects: activeProjectIds.length,
    projectsByPhase,
  });
}
