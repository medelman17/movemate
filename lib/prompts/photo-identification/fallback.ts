import type { PromptConfig, PromptBuilder } from "../types";
import type { IdentificationContext } from "./types";

/**
 * Metadata for the fallback photo identification prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "photo-identification-fallback",
  version: "1.0.0",
  model: "openai/gpt-4o",
  maxTokens: 400,
  description: "Last-resort basic category identification when other strategies fail",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-12",
      change: "Initial extraction from inline prompt in identify-from-photo.ts",
    },
  ],
};

/**
 * Builds the fallback photo identification prompt.
 *
 * This is the simplest strategy, used as a last resort when both
 * detailed and visual strategies fail. Attempts to identify just
 * the basic category of the item.
 *
 * Always returns low confidence and may set needsManualReview: true.
 *
 * @param context - Optional context to improve identification
 * @returns The formatted prompt string ready for the vision model
 */
export const buildPrompt: PromptBuilder<IdentificationContext> = (context) => {
  const contextNote = context.userContext
    ? `\n\nUSER PROVIDED CONTEXT: ${context.userContext}\nUse this information to improve identification.`
    : "";

  return `Identify the basic category of the item in this image.

Return JSON:
{
  "productName": "generic category",
  "fullProductName": "generic category with visible details",
  "confidence": "low",
  "reasoning": "explanation",
  "needsManualReview": true/false,
  "clarificationQuestions": []
}

Return ONLY valid JSON.${contextNote}`;
};
