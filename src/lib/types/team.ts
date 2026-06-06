// SPEC: SPEC-DATA-MODEL.md > team_users
import type { InferSelectModel } from "drizzle-orm";
import type { teamUsers } from "@/lib/db/schema";

export type TeamUser = InferSelectModel<typeof teamUsers>;

export type TeamUserRole = "admin" | "member";
