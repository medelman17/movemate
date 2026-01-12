import type { PromptConfig, PromptBuilder } from "../types";
import type { IdentificationContext } from "./types";

/**
 * Metadata for the visual photo identification prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "photo-identification-visual",
  version: "1.0.0",
  model: "openai/gpt-4o",
  maxTokens: 400,
  description: "Visual-focused analysis ignoring unclear text, focusing on shape, materials, and characteristics",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-12",
      change: "Initial extraction from inline prompt in identify-from-photo.ts",
    },
  ],
};

/**
 * Builds the visual photo identification prompt.
 *
 * This strategy focuses purely on visual characteristics when text/labels
 * are unclear or when the detailed strategy fails. Useful for:
 * - Blurry photos
 * - Photos where text isn't readable
 * - Generic furniture without visible branding
 *
 * @param context - Optional context to improve identification
 * @returns The formatted prompt string ready for the vision model
 */
export const buildPrompt: PromptBuilder<IdentificationContext> = (context) => {
  const contextNote = context.userContext
    ? `\n\nUSER PROVIDED CONTEXT: ${context.userContext}\nUse this information to improve identification.`
    : "";

  return `Look at this image and describe what you see, focusing on the item type and characteristics.

INSTRUCTIONS:
1. Ignore any text/labels you can't read clearly
2. Focus on shape, size, material, color, style
3. Provide both simple and detailed names
4. Handle edge cases (blurry, multiple objects, partial visibility)

Return a JSON object:
{
  "productName": "Simple type (e.g., Bookshelf, Armchair)",
  "fullProductName": "Detailed description (e.g., Wooden Bookshelf with Glass Doors, Blue Velvet Armchair)",
  "confidence": "medium|low",
  "reasoning": "visual characteristics observed",
  "needsManualReview": false,
  "clarificationQuestions": ["helpful questions"]
}

Return ONLY valid JSON.${contextNote}`;
};
