// SPEC: CLAUDE.md > Use Server Actions for mutations
// DEP-MAP: Project Management > SERVER > createProject, updateProject, milestones, questions
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  projects,
  projectPhases,
  projectMilestones,
  projectRepos,
  projectDemos,
  projectQuestions,
  activityLog,
} from "@/lib/db/schema";
import { requireTeam, requireClient } from "@/lib/auth/helpers";
import { sendEmail } from "@/lib/email/client";
import { milestoneCompleted } from "@/lib/email/templates/milestone-completed";
import { questionReplied } from "@/lib/email/templates/question-replied";
import { clientQuestionAlert } from "@/lib/email/templates/client-question-alert";
import { getClientForProject } from "@/lib/db/queries/projects";
import { DEFAULT_PROJECT_PHASES } from "@/lib/types/constants";
import type { ProjectCreateInput } from "@/lib/types/schemas";
import { env } from "@/lib/env";

export async function createProject(data: ProjectCreateInput) {
  try {
    const user = await requireTeam();

    const [project] = await db
      .insert(projects)
      .values({
        name: data.name,
        clientId: data.client_id,
        projectType: data.project_type || null,
        description: data.description || null,
        status: "draft",
        pricingType: data.pricing_type,
        totalValue: String(data.total_value),
        startDate: data.start_date || null,
        targetEndDate: data.target_end_date || null,
        createdBy: user.id,
      })
      .returning();

    // Create default phases and milestones
    let milestoneOrder = 0;
    for (const phaseTemplate of DEFAULT_PROJECT_PHASES) {
      const [phase] = await db
        .insert(projectPhases)
        .values({
          projectId: project.id,
          name: phaseTemplate.name,
          sortOrder: phaseTemplate.sortOrder,
        })
        .returning();

      for (const milestoneTitle of phaseTemplate.milestones) {
        await db.insert(projectMilestones).values({
          projectId: project.id,
          phaseId: phase.id,
          title: milestoneTitle,
          sortOrder: milestoneOrder++,
        });
      }
    }

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "project.created",
      entityType: "project",
      entityId: project.id,
      metadata: { name: project.name, clientId: project.clientId },
    }).catch(() => {});

    revalidatePath("/admin/projects");
    return { success: true, data: project };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to create project" } };
  }
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string; status?: string; totalValue?: string }
) {
  try {
    const user = await requireTeam();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.status !== undefined) updates.status = data.status;
    if (data.totalValue !== undefined) updates.totalValue = data.totalValue;

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: { code: "CB-DB-002", message: "Project not found" } };
    }

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "project.updated",
      entityType: "project",
      entityId: id,
    }).catch(() => {});

    revalidatePath(`/admin/projects/${id}`);
    revalidatePath("/admin/projects");
    return { success: true, data: updated };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to update project" } };
  }
}

export async function updateMilestone(
  id: string,
  data: { title?: string; status?: string; dueDate?: string | null; triggersInvoice?: boolean; invoiceAmount?: number | null }
) {
  try {
    const user = await requireTeam();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.status !== undefined) updates.status = data.status;
    if (data.dueDate !== undefined) updates.dueDate = data.dueDate;
    if (data.triggersInvoice !== undefined) updates.triggersInvoice = data.triggersInvoice;
    if (data.invoiceAmount !== undefined) updates.invoiceAmount = data.invoiceAmount ? String(data.invoiceAmount) : null;

    if (data.status === "completed") {
      updates.completedAt = new Date();
    }

    const [updated] = await db
      .update(projectMilestones)
      .set(updates)
      .where(eq(projectMilestones.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: { code: "CB-DB-002", message: "Milestone not found" } };
    }

    // If completed, send email to client
    if (data.status === "completed") {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, updated.projectId))
        .limit(1);

      if (project) {
        const client = await getClientForProject(project.clientId);
        if (client) {
          const template = milestoneCompleted({
            clientName: client.fullName,
            projectName: project.name,
            milestoneName: updated.title,
          });
          sendEmail({
            to: client.email,
            subject: template.subject,
            html: template.html,
            from: env.EMAIL_FROM,
          }).catch((err) => console.error("[CB-INT-001] Milestone email failed:", err));
        }
      }

      await db.insert(activityLog).values({
        actorId: user.id,
        actorType: "team",
        action: "milestone.completed",
        entityType: "milestone",
        entityId: id,
        metadata: { projectId: updated.projectId, title: updated.title },
      }).catch(() => {});
    }

    revalidatePath(`/admin/projects/${updated.projectId}`);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to update milestone" } };
  }
}

export async function createPhase(projectId: string, name: string, sortOrder: number) {
  try {
    await requireTeam();

    const [phase] = await db
      .insert(projectPhases)
      .values({ projectId, name, sortOrder })
      .returning();

    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: phase };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to create phase" } };
  }
}

export async function createMilestone(
  projectId: string,
  phaseId: string,
  title: string,
  sortOrder: number
) {
  try {
    await requireTeam();

    const [milestone] = await db
      .insert(projectMilestones)
      .values({ projectId, phaseId, title, sortOrder })
      .returning();

    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: milestone };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to create milestone" } };
  }
}

export async function linkRepo(projectId: string, owner: string, repo: string) {
  try {
    await requireTeam();

    // Validate repo exists via GitHub API
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

    try {
      await octokit.repos.get({ owner, repo });
    } catch {
      return { success: false, error: { code: "CB-INT-004", message: "Repository not found on GitHub" } };
    }

    const [linked] = await db
      .insert(projectRepos)
      .values({
        projectId,
        githubOwner: owner,
        githubRepo: repo,
        githubUrl: `https://github.com/${owner}/${repo}`,
      })
      .returning();

    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: linked };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to link repository" } };
  }
}

export async function getRepoActivity(repoId: string) {
  try {
    const [repo] = await db
      .select()
      .from(projectRepos)
      .where(eq(projectRepos.id, repoId))
      .limit(1);

    if (!repo) {
      return { success: false, error: { code: "CB-DB-002", message: "Repo not found" } };
    }

    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

    const [branches, commits] = await Promise.all([
      octokit.repos.listBranches({ owner: repo.githubOwner, repo: repo.githubRepo, per_page: 10 }),
      octokit.repos.listCommits({ owner: repo.githubOwner, repo: repo.githubRepo, per_page: 10 }),
    ]);

    // Update last synced
    await db
      .update(projectRepos)
      .set({ lastSyncedAt: new Date() })
      .where(eq(projectRepos.id, repoId));

    return {
      success: true,
      data: {
        branches: branches.data.map((b) => ({ name: b.name, protected: b.protected })),
        commits: commits.data.map((c) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split("\n")[0],
          author: c.commit.author?.name ?? "Unknown",
          date: c.commit.author?.date ?? null,
        })),
      },
    };
  } catch {
    return { success: false, error: { code: "CB-INT-004", message: "Failed to fetch repo activity" } };
  }
}

export async function createDemo(
  projectId: string,
  data: { title: string; url: string; description?: string }
) {
  try {
    const user = await requireTeam();

    const [demo] = await db
      .insert(projectDemos)
      .values({
        projectId,
        title: data.title,
        url: data.url,
        description: data.description || null,
        createdBy: user.id,
      })
      .returning();

    revalidatePath(`/admin/projects/${projectId}`);
    return { success: true, data: demo };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to create demo" } };
  }
}

export async function toggleDemoApproval(demoId: string) {
  try {
    await requireTeam();

    const [demo] = await db
      .select()
      .from(projectDemos)
      .where(eq(projectDemos.id, demoId))
      .limit(1);

    if (!demo) {
      return { success: false, error: { code: "CB-DB-002", message: "Demo not found" } };
    }

    const [updated] = await db
      .update(projectDemos)
      .set({ isApproved: !demo.isApproved })
      .where(eq(projectDemos.id, demoId))
      .returning();

    revalidatePath(`/admin/projects/${demo.projectId}`);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to toggle demo" } };
  }
}

export async function submitQuestion(projectId: string, questionText: string) {
  try {
    const client = await requireClient();

    const [question] = await db
      .insert(projectQuestions)
      .values({
        projectId,
        clientId: client.id,
        questionText,
      })
      .returning();

    // Notify team
    const teamEmails = env.TEAM_NOTIFICATION_EMAILS
      ? env.TEAM_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : [];

    if (teamEmails.length > 0) {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (project) {
        const template = clientQuestionAlert({
          clientName: client.fullName,
          projectName: project.name,
          question: questionText,
        });
        sendEmail({
          to: teamEmails,
          subject: template.subject,
          html: template.html,
        }).catch((err) => console.error("[CB-INT-001] Question alert failed:", err));
      }
    }

    await db.insert(activityLog).values({
      actorType: "client",
      action: "question.submitted",
      entityType: "question",
      entityId: question.id,
      metadata: { projectId, clientId: client.id },
    }).catch(() => {});

    revalidatePath(`/portal/projects/${projectId}`);
    return { success: true, data: question };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to submit question" } };
  }
}

export async function replyQuestion(questionId: string, replyText: string) {
  try {
    const user = await requireTeam();

    const [updated] = await db
      .update(projectQuestions)
      .set({
        replyText,
        repliedBy: user.id,
        repliedAt: new Date(),
        status: "replied",
      })
      .where(eq(projectQuestions.id, questionId))
      .returning();

    if (!updated) {
      return { success: false, error: { code: "CB-DB-002", message: "Question not found" } };
    }

    // Send reply email to client
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, updated.projectId))
      .limit(1);

    if (project) {
      const client = await getClientForProject(project.clientId);
      if (client) {
        const template = questionReplied({
          clientName: client.fullName,
          projectName: project.name,
          question: updated.questionText,
          reply: replyText,
        });
        sendEmail({
          to: client.email,
          subject: template.subject,
          html: template.html,
          from: env.EMAIL_FROM,
        }).catch((err) => console.error("[CB-INT-001] Reply email failed:", err));
      }
    }

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "question.replied",
      entityType: "question",
      entityId: questionId,
      metadata: { projectId: updated.projectId },
    }).catch(() => {});

    revalidatePath(`/admin/projects/${updated.projectId}`);
    return { success: true, data: updated };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to reply" } };
  }
}
