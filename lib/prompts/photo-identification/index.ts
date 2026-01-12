/**
 * Photo identification prompts for analyzing product images.
 *
 * V1 (Legacy): Three-strategy fallback approach
 * - detailed: Attempts to find brand names, model numbers, specific features
 * - visual: Focuses on visual characteristics when text is unclear
 * - fallback: Basic category identification as last resort
 *
 * V2 (Recommended): Strategic single-pass approach
 * - strategic: Single call with smart questioning based on item analysis
 */

// Types and schemas
export * from "./types";

// Individual prompt builders and metadata
export {
  buildPrompt as buildDetailedPrompt,
  PROMPT_META as DETAILED_META,
} from "./detailed";

export {
  buildPrompt as buildVisualPrompt,
  PROMPT_META as VISUAL_META,
} from "./visual";

export {
  buildPrompt as buildFallbackPrompt,
  PROMPT_META as FALLBACK_META,
} from "./fallback";

// V2 Strategic prompt (recommended)
export {
  buildPrompt as buildStrategicPrompt,
  PROMPT_META as STRATEGIC_META,
} from "./strategic";

// Re-import for registry
import {
  buildPrompt as buildDetailedPrompt,
  PROMPT_META as DETAILED_META,
} from "./detailed";
import {
  buildPrompt as buildVisualPrompt,
  PROMPT_META as VISUAL_META,
} from "./visual";
import {
  buildPrompt as buildFallbackPrompt,
  PROMPT_META as FALLBACK_META,
} from "./fallback";
import type { IdentificationStrategy } from "./types";

/**
 * Strategy registry for programmatic access to all photo identification prompts.
 */
export const photoIdentificationPrompts = {
  detailed: { build: buildDetailedPrompt, config: DETAILED_META },
  visual: { build: buildVisualPrompt, config: VISUAL_META },
  fallback: { build: buildFallbackPrompt, config: FALLBACK_META },
} as const;

/**
 * Helper to get prompt by strategy name.
 *
 * @param strategy - The identification strategy to use
 * @returns Prompt builder and configuration for the strategy
 *
 * @example
 * ```typescript
 * const { build, config } = getPhotoPrompt("detailed");
 * const promptText = build({ userContext: "This is my couch" });
 * ```
 */
export function getPhotoPrompt(strategy: IdentificationStrategy) {
  return photoIdentificationPrompts[strategy];
}
