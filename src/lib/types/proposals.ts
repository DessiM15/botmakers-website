// SPEC: SPEC-DATA-MODEL.md > proposals, proposal_line_items
import type { InferSelectModel } from "drizzle-orm";
import type { proposals, proposalLineItems } from "@/lib/db/schema";

export type Proposal = InferSelectModel<typeof proposals>;
export type ProposalLineItem = InferSelectModel<typeof proposalLineItems>;

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "expired";

export type PricingType = "fixed" | "phased" | "hourly";

export interface ProposalWithItems extends Proposal {
  lineItems: ProposalLineItem[];
}
