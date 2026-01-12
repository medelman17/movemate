import type { PromptConfig } from "../types";

/**
 * Metadata for the name simplification prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "simplify-product-name",
  version: "1.0.0",
  model: "openai/gpt-4o-mini",
  maxTokens: 50,
  description: "Simplifies detailed product names to generic item types for moving inventory",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-12",
      change: "Initial extraction from inline prompt in simplify-product-name.ts",
    },
  ],
};

/**
 * System prompt for simplifying product names.
 *
 * This prompt removes brand names, model numbers, colors, dimensions,
 * and style descriptors, leaving only the core item type.
 *
 * Used as a system message in AI calls. The user message should be
 * the full product name to simplify.
 *
 * @example
 * ```typescript
 * const messages = [
 *   { role: "system", content: simplifyNameSystemPrompt },
 *   { role: "user", content: "IKEA KALLAX Shelf unit, white, 77x147 cm" }
 * ];
 * // AI will respond with: "Shelf Unit"
 * ```
 */
export const simplifyNameSystemPrompt = `You are a product name simplifier. Your job is to convert detailed product names into simple, generic item types suitable for a moving inventory.

RULES:
1. Remove all brand names (IKEA, Yaheetech, HOMCOM, etc.)
2. Remove model names/numbers (KALLAX, HEMNES, etc.)
3. Remove colors (white, dark blue, cream, etc.)
4. Remove dimensions and measurements
5. Remove material descriptions unless essential to the item type
6. Remove style descriptors (modern, vintage, velvet, etc.)
7. Keep only the core item type
8. Use title case
9. Keep it to 1-3 words maximum

EXAMPLES:
- "IKEA KALLAX Shelf unit, white, 77x147 cm" → "Shelf Unit"
- "Michigan Velvet Ottoman Dark Blue with Storage" → "Storage Ottoman"
- "Yaheetech 5-Tier Metal Bookshelf" → "Bookshelf"
- "HEMNES 8-drawer dresser, white stain, 63x37 3/8" → "Dresser"
- "Modern Tufted Velvet Accent Chair in Navy" → "Accent Chair"
- "42" Samsung Smart TV 4K UHD" → "TV"
- "KitchenAid Artisan 5-Quart Stand Mixer Red" → "Stand Mixer"

Return ONLY the simplified name, nothing else.`;
