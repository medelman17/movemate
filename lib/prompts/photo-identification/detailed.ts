import { confidenceLevels } from "../shared";
import type { PromptConfig, PromptBuilder } from "../types";
import type { IdentificationContext } from "./types";

/**
 * Metadata for the detailed photo identification prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "photo-identification-detailed",
  version: "1.0.0",
  model: "openai/gpt-4o",
  maxTokens: 400,
  description: "Detailed photo analysis attempting to identify brand, model, and specific features",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-12",
      change: "Initial extraction from inline prompt in identify-from-photo.ts",
    },
  ],
};

/**
 * Builds the detailed photo identification prompt.
 *
 * This strategy attempts to identify products by looking for:
 * - Brand logos and labels
 * - Model numbers
 * - Distinctive features, colors, materials
 *
 * Best used as the first attempt when analyzing product photos.
 *
 * @param context - Optional context to improve identification
 * @returns The formatted prompt string ready for the vision model
 *
 * @example
 * ```typescript
 * const prompt = buildPrompt({ userContext: "This is my IKEA bookshelf" });
 * ```
 */
export const buildPrompt: PromptBuilder<IdentificationContext> = (context) => {
  const contextNote = context.userContext
    ? `\n\nUSER PROVIDED CONTEXT: ${context.userContext}\nUse this information to improve identification.`
    : "";

  return `Analyze this image and identify the product with as much detail as possible.

CRITICAL INSTRUCTIONS:
1. Look for brand logos, labels, or model numbers
2. Identify specific product names if visible
3. Note distinctive features, colors, materials, style
4. If you see multiple items, focus on the main/largest item
5. Rate your confidence: HIGH (brand/model visible), MEDIUM (distinctive features), LOW (generic)
6. If confidence is LOW or MEDIUM, provide 2-3 clarification questions to ask the user

RETURN TWO NAMES:
- "productName": Simple generic type (e.g., "Coffee Table", "Shelf Unit", "Ottoman")
- "fullProductName": Detailed name with brand/model/specifics (e.g., "IKEA KALLAX Shelf unit, white", "Michigan Velvet Ottoman Dark Blue")

${confidenceLevels}

Return a JSON object with:
{
  "productName": "Simple generic type",
  "fullProductName": "Detailed name with brand/model/specifics",
  "confidence": "high|medium|low",
  "reasoning": "detailed explanation of what you see",
  "needsManualReview": false,
  "clarificationQuestions": ["question 1?", "question 2?"]
}

Return ONLY valid JSON, no other text.${contextNote}`;
};
