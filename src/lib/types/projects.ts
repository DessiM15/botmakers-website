// SPEC: SPEC-DATA-MODEL.md > projects, project_phases, project_milestones, project_repos, project_demos, project_questions
import type { InferSelectModel } from "drizzle-orm";
import type {
  projects,
  projectPhases,
  projectMilestones,
  projectRepos,
  projectDemos,
  projectQuestions,
} from "@/lib/db/schema";

export type Project = InferSelectModel<typeof projects>;
export type ProjectPhase = InferSelectModel<typeof projectPhases>;
export type ProjectMilestone = InferSelectModel<typeof projectMilestones>;
export type ProjectRepo = InferSelectModel<typeof projectRepos>;
export type ProjectDemo = InferSelectModel<typeof projectDemos>;
export type ProjectQuestion = InferSelectModel<typeof projectQuestions>;

export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

export type QuestionStatus = "pending" | "replied";

export interface PhaseWithMilestones extends ProjectPhase {
  milestones: ProjectMilestone[];
}

export interface ProjectWithProgress extends Project {
  progress: number;
  phases: PhaseWithMilestones[];
  totalMilestones: number;
  completedMilestones: number;
}
