export type DocumentFileType = "pdf" | "xlsx" | "docx";

export interface AmfnDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileType: DocumentFileType;
  fileSize: string;
  category: string;
  canView: boolean;
}

export const AMFN_CATEGORIES = [
  "Foundation Package",
  "Content & Editorial",
  "Operations & Compliance",
  "Analytics & Performance",
  "Strategic Intelligence",
] as const;

export type AmfnCategory = (typeof AMFN_CATEGORIES)[number];

export const AMFN_DOCUMENTS: AmfnDocument[] = [
  {
    id: "package-overview",
    title: "Package Overview",
    description:
      "Orientation guide for the Day-14 Foundation Package. How to read the package, who owns what, and what happens from Day 15.",
    fileName: "00_README_Package_Overview.pdf",
    fileType: "pdf",
    fileSize: "13 KB",
    category: "Foundation Package",
    canView: true,
  },
  {
    id: "brand-guidelines",
    title: "Brand Guidelines",
    description:
      "Color palette, typography, logo system, voice & tone, three-lane founder architecture, and do/don't language rules.",
    fileName: "01_Brand_Guidelines.pdf",
    fileType: "pdf",
    fileSize: "18 KB",
    category: "Foundation Package",
    canView: true,
  },
  {
    id: "how-to-use",
    title: "How to Use This Package",
    description:
      "Detailed operator's manual. Mental model, weekly/monthly operating rhythm, post lifecycle walkthroughs, and common-scenario playbook.",
    fileName: "06_How_To_Use_This_Package.pdf",
    fileType: "pdf",
    fileSize: "37 KB",
    category: "Foundation Package",
    canView: true,
  },
  {
    id: "editorial-calendar",
    title: "90-Day Editorial Calendar",
    description:
      "Day-by-day publishing plan across all six channels with ~340 content pieces. Filtered views per channel with cadence targets.",
    fileName: "02_Editorial_Calendar_90Day.xlsx",
    fileType: "xlsx",
    fileSize: "42 KB",
    category: "Content & Editorial",
    canView: false,
  },
  {
    id: "first-content-batch",
    title: "First Content Batch",
    description:
      "33+ ready-to-publish pieces: LinkedIn company (10), Nelson (5), Reid (3), Hawkins (2), X (10), Instagram (3), Newsletter Issue 01, YouTube Video 01 outline.",
    fileName: "03_First_Content_Batch.docx",
    fileType: "docx",
    fileSize: "52 KB",
    category: "Content & Editorial",
    canView: false,
  },
  {
    id: "workflow-compliance",
    title: "Workflow & Compliance",
    description:
      "GREEN/YELLOW/RED content classification, 5-stage pre-publication workflow, Reg FD guardrails, and crisis communications protocol.",
    fileName: "04_Workflow_and_Compliance.pdf",
    fileType: "pdf",
    fileSize: "19 KB",
    category: "Operations & Compliance",
    canView: true,
  },
  {
    id: "kpi-dashboards",
    title: "KPI Dashboards",
    description:
      "90-day and 12-month targets, weekly follower tracker, content output tracking, engagement quality, and competitive benchmarks.",
    fileName: "05_KPI_Dashboards.xlsx",
    fileType: "xlsx",
    fileSize: "23 KB",
    category: "Analytics & Performance",
    canView: false,
  },
  {
    id: "market-intelligence",
    title: "Market Intelligence Report",
    description:
      "41-page market analysis covering fusion energy market sizing, competitive landscape, brand presence audit, and full activation strategy.",
    fileName: "American-Fusion-Market-Intelligence-Report.pdf",
    fileType: "pdf",
    fileSize: "123 KB",
    category: "Strategic Intelligence",
    canView: true,
  },
];

export function getDocumentsByCategory(): Map<AmfnCategory, AmfnDocument[]> {
  const grouped = new Map<AmfnCategory, AmfnDocument[]>();
  for (const cat of AMFN_CATEGORIES) {
    grouped.set(
      cat,
      AMFN_DOCUMENTS.filter((d) => d.category === cat)
    );
  }
  return grouped;
}
