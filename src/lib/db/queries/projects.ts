// SPEC: CLAUDE.md > All DB queries in src/lib/db/queries/
// DEP-MAP: Project Management > SERVER > getProjects, getProjectById
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  projects,
  projectPhases,
  projectMilestones,
  projectRepos,
  projectDemos,
  projectQuestions,
  clients,
  invoices,
} from "@/lib/db/schema";
import type { ProjectWithProgress, PhaseWithMilestones } from "@/lib/types/projects";

export async function getProjects() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

  const result: ProjectWithProgress[] = [];

  for (const project of allProjects) {
    const milestones = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, project.id));

    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    result.push({
      ...project,
      progress,
      phases: [],
      totalMilestones: total,
      completedMilestones: completed,
    });
  }

  return result;
}

export async function getProjectById(id: string): Promise<ProjectWithProgress | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) return null;

  const phases = await db
    .select()
    .from(projectPhases)
    .where(eq(projectPhases.projectId, id))
    .orderBy(asc(projectPhases.sortOrder));

  const milestones = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, id))
    .orderBy(asc(projectMilestones.sortOrder));

  const phasesWithMilestones: PhaseWithMilestones[] = phases.map((phase) => ({
    ...phase,
    milestones: milestones.filter((m) => m.phaseId === phase.id),
  }));

  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === "completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    ...project,
    progress,
    phases: phasesWithMilestones,
    totalMilestones: total,
    completedMilestones: completed,
  };
}

export async function getProjectsByClientId(clientId: string): Promise<ProjectWithProgress[]> {
  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.createdAt));

  const result: ProjectWithProgress[] = [];

  for (const project of clientProjects) {
    const milestones = await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, project.id));

    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    result.push({
      ...project,
      progress,
      phases: [],
      totalMilestones: total,
      completedMilestones: completed,
    });
  }

  return result;
}

export async function getReposForProject(projectId: string) {
  return db
    .select()
    .from(projectRepos)
    .where(eq(projectRepos.projectId, projectId))
    .orderBy(desc(projectRepos.createdAt));
}

export async function getDemosForProject(projectId: string) {
  return db
    .select()
    .from(projectDemos)
    .where(eq(projectDemos.projectId, projectId))
    .orderBy(desc(projectDemos.createdAt));
}

export async function getQuestionsForProject(projectId: string) {
  return db
    .select()
    .from(projectQuestions)
    .where(eq(projectQuestions.projectId, projectId))
    .orderBy(desc(projectQuestions.createdAt));
}

export async function getInvoicesForProject(projectId: string) {
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.projectId, projectId))
    .orderBy(desc(invoices.createdAt));
}

export async function getClientForProject(clientId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  return client ?? null;
}

export async function getOverdueMilestones() {
  const today = new Date().toISOString().split("T")[0];

  return db
    .select({
      milestone: projectMilestones,
      project: projects,
    })
    .from(projectMilestones)
    .innerJoin(projects, eq(projectMilestones.projectId, projects.id))
    .where(
      and(
        sql`${projectMilestones.dueDate} < ${today}`,
        eq(projectMilestones.status, "pending")
      )
    )
    .orderBy(asc(projectMilestones.dueDate));
}
