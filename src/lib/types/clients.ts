// SPEC: SPEC-DATA-MODEL.md > clients
import type { InferSelectModel } from "drizzle-orm";
import type { clients } from "@/lib/db/schema";
import type { ProjectWithProgress } from "./projects";

export type Client = InferSelectModel<typeof clients>;

export interface ClientWithProjects extends Client {
  projects: ProjectWithProgress[];
  openInvoiceTotal: number;
  projectCount: number;
  lastContactedAt: Date | null;
}
