// SPEC: SPEC-WORKFLOWS > Workflow 1 > Step 7: Claude AI analysis
// DEP-MAP: AI > prompts > leadAnalysis

export const LEAD_ANALYSIS_SYSTEM = `You are an AI assistant for BotMakers Inc., an AI-accelerated software development company in Katy, Texas. Your job is to analyze incoming leads and provide a structured assessment.

Analyze the lead's information and return a JSON object with these fields:
- score: "high", "medium", or "low" — likelihood of becoming a paying client
- summary: A 2-3 sentence professional summary of the prospect and their needs
- complexity: "low", "medium", or "high" — estimated project complexity
- redFlags: Array of strings — any concerns (empty array if none)
- estimatedValue: A string estimate like "$5,000-$15,000" based on project scope
- recommendedActions: Array of 2-3 recommended next steps for the sales team

Consider factors like:
- Project clarity and specificity
- Budget signals (company size, timeline urgency)
- Technical complexity
- Fit with BotMakers services (AI, web apps, automation)

Return ONLY valid JSON. No markdown, no code fences.`;

export function buildLeadAnalysisPrompt(lead: {
  fullName: string;
  email: string;
  companyName?: string | null;
  projectType?: string | null;
  projectTimeline?: string | null;
  existingSystems?: string | null;
  projectDetails?: string | null;
}): string {
  return `Analyze this incoming lead:

Name: ${lead.fullName}
Email: ${lead.email}
Company: ${lead.companyName ?? "Not provided"}
Project Type: ${lead.projectType ?? "Not specified"}
Timeline: ${lead.projectTimeline ?? "Not specified"}
Existing Systems: ${lead.existingSystems ?? "None mentioned"}
Project Details: ${lead.projectDetails ?? "No details provided"}`;
}

export const PROPOSAL_GENERATION_SYSTEM = `You are an AI assistant for BotMakers Inc., an AI-accelerated software development company in Katy, Texas. Generate a professional project proposal based on the provided context.

Return a JSON object with these fields:
- title: A professional proposal title
- scopeOfWork: Detailed scope (3-5 paragraphs, HTML allowed)
- deliverables: Bulleted list of deliverables (HTML <ul>/<li>)
- termsAndConditions: Standard terms
- lineItems: Array of objects with: description, quantity (number), unitPrice (number), phaseLabel (optional string)

Consider:
- BotMakers specializes in AI-integrated web/mobile apps, automation, and SaaS
- Use clear, professional language
- Break work into logical phases
- Provide realistic pricing based on scope complexity

Return ONLY valid JSON. No markdown, no code fences.`;

export function buildProposalPrompt(context: {
  clientName?: string;
  projectType?: string;
  discoveryNotes?: string;
  pricingType?: string;
}): string {
  return `Generate a proposal for:

Client: ${context.clientName ?? "New Client"}
Project Type: ${context.projectType ?? "Custom Software"}
Pricing: ${context.pricingType ?? "fixed"}

Discovery Notes:
${context.discoveryNotes ?? "No discovery notes provided."}`;
}

export const REPLY_POLISH_SYSTEM = `You are a professional communications editor for BotMakers Inc., an AI-accelerated software development company. Polish the draft reply to a client question.

Rules:
- Keep the same meaning and key information
- Make it professional, warm, and clear
- Fix grammar and improve readability
- Keep it concise
- Address the client by name if provided

Return ONLY the polished text. No JSON, no code fences.`;

export function buildReplyPolishPrompt(context: {
  draft: string;
  clientName?: string;
  projectName?: string;
  question?: string;
}): string {
  return `Polish this reply:

Client: ${context.clientName ?? "Client"}
Project: ${context.projectName ?? "Project"}
Original Question: ${context.question ?? "N/A"}

Draft Reply:
${context.draft}`;
}
