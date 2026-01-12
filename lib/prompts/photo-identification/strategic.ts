import type { PromptConfig, PromptBuilder } from "../types";
import type { StrategicIdentificationContext } from "./types";
import { confidenceLevels } from "../shared/confidence-levels";
import { movingInventoryContext, itemCategories } from "../shared/moving-context";

/**
 * Metadata for the strategic photo identification prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "photo-identification-strategic",
  version: "2.0.0",
  model: "openai/gpt-4o",
  maxTokens: 800,
  description:
    "Single-pass strategic photo identification with smart questioning. Replaces multi-attempt approach.",
  changelog: [
    {
      version: "2.0.0",
      date: "2026-01-12",
      change:
        "Complete redesign: single GPT-4o call with strategic questioning instead of 3-attempt fallback sequence",
    },
  ],
};

/**
 * Builds the strategic identification prompt.
 *
 * This prompt analyzes a photo once and determines the best strategy for identification,
 * including what questions to ask the user for optimal results.
 *
 * @param context - User-provided hints and previous answers
 * @returns Formatted prompt string
 */
export const buildPrompt: PromptBuilder<StrategicIdentificationContext> = (context) => {
  const { userContext, previousAnswers } = context;

  const contextSection = userContext
    ? `\n\nUSER CONTEXT:\n${userContext}\n`
    : "";

  const answersSection =
    previousAnswers && Object.keys(previousAnswers).length > 0
      ? `\n\nPREVIOUS ANSWERS:\n${Object.entries(previousAnswers)
          .map(([q, a]) => `Q: ${q}\nA: ${a}`)
          .join("\n\n")}\n`
      : "";

  return `You are an expert at identifying household items from photos for moving inventory purposes.

${movingInventoryContext}

AVAILABLE CATEGORIES: ${itemCategories.join(", ")}

Your task is to analyze the photo and determine the BEST STRATEGY for identifying this item precisely. Don't just describe what you see—think like a detective about how to find the exact product.

${contextSection}${answersSection}

STRATEGIC APPROACHES (choose the most effective):

1. **check_label**: If there might be a physical label, tag, or sticker
   - Ask user to check specific locations (under cushions, back of item, bottom, inside drawer)
   - Only use if labels are commonly found on this type of item
   - Questions should guide them to likely label locations

2. **purchase_history**: If knowing where they bought it would narrow it down significantly
   - Ask where purchased (retailer name matters more than date)
   - Ask approximate price range to narrow catalog
   - Best for furniture, large items from major retailers

3. **store_search**: When item has distinctive features + we know the store
   - Ask for retailer if not already known
   - Ask for distinguishing features (color, material, special features)
   - Search their catalog with specific criteria

4. **feature_match**: When item is generic but has recognizable style/brand aesthetic
   - Ask about distinctive details (hardware, leg style, cushion pattern)
   - Use visual features to search across retailers
   - Good for mid-century modern, IKEA-style, etc.

5. **use_estimates**: When item is very generic or custom-made
   - Don't ask questions, just provide visual estimates
   - Use for: custom furniture, very old items, generic basics
   - Still identify the item type accurately

CRITICAL RULES:

1. **ONE strategy per item** - pick the most effective approach
2. **Maximum 3 questions** - each question must be high-value
3. **Specific questions** - not "Can you provide more details?" but "Where did you purchase this sofa?"
4. **Consider user context** - if they already told you something, don't ask again
5. **Visual estimates ALWAYS** - provide dimension/weight estimates regardless of strategy
6. **Immediate identification** - if brand/model visible in photo, provide it immediately

QUESTION QUALITY EXAMPLES:

GOOD:
- "Where did you purchase this sofa? (e.g., IKEA, Wayfair, West Elm)"
- "What's the approximate price range? (Under $300, $300-$800, Over $800)"
- "Can you check for a tag under the seat cushions or on the bottom?"
- "What material is the surface? (Wood, metal, glass, laminate)"

BAD:
- "Can you provide more details?"
- "Take another photo from a different angle"
- "What do you remember about this item?"
- "Is there anything else you can tell me?"

${confidenceLevels}

VISUAL ESTIMATES:
Provide estimates even if you plan to ask questions. These serve as fallbacks.
- Dimensions: Best guess in inches (use common object sizes for reference)
- Weight: Realistic estimate in pounds for moving purposes
- Can disassemble: Based on item type and visible construction

OUTPUT STRUCTURE:
Your response will be parsed as JSON with this structure:
{
  "itemType": "Coffee Table",
  "category": "Furniture",
  "distinctiveFeatures": ["Mid-century modern legs", "White marble top", "Gold metal frame"],
  "styleFamily": "Mid-Century Modern",
  "visualEstimates": {
    "dimensions": { "length": 48, "width": 24, "height": 18 },
    "weight": 60,
    "canDisassemble": false,
    "notes": "Marble top makes this heavy"
  },
  "strategy": {
    "approach": "purchase_history",
    "confidence": 0.8,
    "reasoning": "Distinctive mid-century style from major retailer, knowing where purchased will enable targeted catalog search",
    "questions": [
      {
        "question": "Where did you purchase this coffee table?",
        "rationale": "Retailer catalog search will find exact match",
        "inputType": "select",
        "options": ["IKEA", "West Elm", "CB2", "Article", "Wayfair", "Amazon", "Other"],
        "placeholder": null
      },
      {
        "question": "What was the approximate price range?",
        "rationale": "Narrows down catalog section",
        "inputType": "select",
        "options": ["Under $300", "$300-$800", "$800-$1500", "Over $1500"],
        "placeholder": null
      }
    ]
  },
  "immediateIdentification": null
}

If brand/model IS visible, include immediateIdentification:
{
  "immediateIdentification": {
    "productName": "Coffee Table",
    "fullProductName": "IKEA LACK Coffee Table, white, 35x22"",
    "confidence": "high"
  }
}

Remember: One strategic question ("Where did you buy it?") beats three photo retakes.`;
};
