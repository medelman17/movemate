import type { PromptConfig, PromptBuilder } from "../types";
import type { PackingTipsContext } from "./types";

/**
 * Metadata for the packing best practices prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "packing-tips-best-practices",
  version: "1.0.0",
  model: "perplexity/sonar-pro",
  maxTokens: 800,
  description: "Researches best practices and tips for moving/storing specific items",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-14",
      change: "Initial implementation for packing agent feature",
    },
  ],
};

/**
 * Builds the packing best practices research prompt.
 *
 * This prompt instructs the AI to search the web for best practices,
 * tips, and tricks for moving and storing a specific item.
 *
 * @param context - Context containing item details
 * @returns The formatted prompt string ready for the research model
 *
 * @example
 * ```typescript
 * const prompt = buildPrompt({
 *   itemName: "Coffee Table",
 *   category: "Furniture",
 *   canDisassemble: true
 * });
 * ```
 */
export const buildPrompt: PromptBuilder<PackingTipsContext> = (context) => {
  const itemIdentifier = context.fullProductName || context.itemName;

  const contextDetails: string[] = [];

  if (context.category) {
    contextDetails.push(`Category: ${context.category}`);
  }

  if (context.description) {
    contextDetails.push(`Description: ${context.description}`);
  }

  if (context.canDisassemble !== undefined) {
    contextDetails.push(`Can be disassembled: ${context.canDisassemble ? "Yes" : "No"}`);
  }

  if (context.isFragile !== undefined) {
    contextDetails.push(`Fragile: ${context.isFragile ? "Yes" : "No"}`);
  }

  if (context.dimensions && (context.dimensions.length || context.dimensions.width || context.dimensions.height)) {
    const dims = [];
    if (context.dimensions.length) dims.push(`${context.dimensions.length}"`);
    if (context.dimensions.width) dims.push(`${context.dimensions.width}"`);
    if (context.dimensions.height) dims.push(`${context.dimensions.height}"`);
    contextDetails.push(`Dimensions: ${dims.join(" x ")}`);
  }

  if (context.weight) {
    contextDetails.push(`Weight: ${context.weight} lbs`);
  }

  const contextSection = contextDetails.length > 0
    ? `\n\nITEM DETAILS:\n${contextDetails.join("\n")}`
    : "";

  return `Research best practices and expert tips for moving and storing the following item: "${itemIdentifier}"
${contextSection}

Your task is to search the web for professional moving advice, storage tips, and best practices specifically for this type of item.

WHAT TO RESEARCH:
1. Packing techniques and materials needed
2. Protection methods (wrapping, padding, containers)
3. Disassembly guidance (if applicable)
4. Common mistakes to avoid
5. Storage best practices
6. Special handling requirements
7. Weight distribution and safety tips

RESPONSE REQUIREMENTS:
1. Provide 3-6 specific, actionable tips
2. Each tip should be concise (1-2 sentences)
3. Focus on practical advice from professional movers and storage experts
4. Prioritize safety and damage prevention
5. Include any special materials or tools needed
6. Mention any critical warnings or common mistakes

FORMAT:
Return ONLY valid JSON (no markdown, no code blocks):
{
  "tips": [
    "First specific tip with clear action",
    "Second specific tip with clear action",
    "Third specific tip with clear action"
  ],
  "materials": ["Bubble wrap", "Moving blanket", "Packing tape"],
  "warnings": ["Do not stack heavy items on top", "Keep away from moisture"]
}

EXAMPLES OF GOOD TIPS:
- "Wrap each leg individually with bubble wrap and secure with packing tape to prevent scratches during transport"
- "Remove glass shelves and pack separately in dish boxes with cardboard dividers"
- "Use furniture sliders under legs to prevent floor damage when moving"
- "Take photos before disassembly to aid in reassembly at destination"

Focus on advice specific to this item type, not generic moving tips.`;
};
