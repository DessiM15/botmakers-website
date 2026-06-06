// SPEC: CLAUDE.md > AI: Anthropic Claude API
// DEP-MAP: Cross-Cutting > AI Client
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

let _anthropic: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}
