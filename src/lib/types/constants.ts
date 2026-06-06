// SPEC: SPEC-DATA-MODEL.md > Default Project Phases Template

export const DEFAULT_PROJECT_PHASES = [
  {
    name: "Discovery",
    sortOrder: 1,
    milestones: [
      "Initial consultation",
      "Requirements documented",
      "Project plan approved",
    ],
  },
  {
    name: "MVP Build",
    sortOrder: 2,
    milestones: [
      "Dev environment setup",
      "Core features implemented",
      "Internal testing passed",
    ],
  },
  {
    name: "Revision",
    sortOrder: 3,
    milestones: [
      "Client feedback collected",
      "Revisions implemented",
      "Final testing passed",
    ],
  },
  {
    name: "Launch",
    sortOrder: 4,
    milestones: [
      "Deployment completed",
      "Client training done",
      "Project handoff complete",
    ],
  },
] as const;

export const DEFAULT_PIPELINE_STAGES = [
  "new_lead",
  "contacted",
  "discovery_scheduled",
  "discovery_completed",
  "proposal_sent",
  "negotiation",
  "contract_signed",
  "active_client",
  "project_delivered",
  "retention",
] as const;

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  discovery_scheduled: "Discovery Scheduled",
  discovery_completed: "Discovery Completed",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  contract_signed: "Contract Signed",
  active_client: "Active Client",
  project_delivered: "Project Delivered",
  retention: "Retention",
};

export const DEFAULT_TERMS = `1. Payment is due within 30 days of invoice date.
2. A 50% deposit is required before work begins.
3. All intellectual property transfers to the client upon final payment.
4. Revisions are included as outlined in the scope of work.
5. Additional requests outside the agreed scope will be quoted separately.
6. Either party may terminate with 14 days written notice.
7. Confidentiality of all shared information is maintained by both parties.`;
