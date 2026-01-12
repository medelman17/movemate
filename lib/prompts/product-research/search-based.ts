import { dimensionConversionRules } from "../shared";
import type { PromptConfig, PromptBuilder } from "../types";
import type { SearchResearchContext } from "./types";

/**
 * Metadata for the search-based product research prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "product-research-search",
  version: "1.0.0",
  model: "perplexity/sonar-pro",
  maxTokens: 1000,
  description: "Searches the web for product specifications by name/description",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-12",
      change: "Initial extraction from inline prompt in product-research.ts",
    },
  ],
};

/**
 * Builds the search-based product research prompt.
 *
 * This prompt instructs the AI to search the web for product specifications
 * when given a product name or description (without a URL).
 *
 * @param context - Context containing the product name
 * @returns The formatted prompt string ready for the research model
 *
 * @example
 * ```typescript
 * const prompt = buildPrompt({ productName: "IKEA KALLAX shelf white" });
 * ```
 */
export const buildPrompt: PromptBuilder<SearchResearchContext> = (context) => {
  return `Search the web for accurate product specifications for: "${context.productName}"

Your task is to find the REAL specifications from manufacturer websites, retailers, or product listings.

CRITICAL INSTRUCTIONS:
1. Extract TWO names:
   - "name": Simple generic type for moving manifest (e.g., "Coffee Table", "TV Stand", "Floor Lamp")
   - "fullProductName": Complete product name with brand, model, specifics (e.g., "IKEA Besta TV Unit, white, 47 1/4x15 3/4x15"")

2. Create a detailed description that includes:
   - Full brand and model information
   - Materials, colors, finish, style
   - Key features and characteristics
   - Size information if relevant to description

Examples:
Search: "Michigan Velvet Ottoman Dark Blue"
- name: "Ottoman"
- fullProductName: "Michigan Velvet Ottoman (Dark Blue)"
- description: "Upholstered ottoman from Michigan furniture collection featuring dark blue velvet fabric. Round shape with button-tufted top and wooden legs."

${dimensionConversionRules}

DIMENSION AND WEIGHT INSTRUCTIONS:
1. Search for the exact product name on manufacturer websites (IKEA, Amazon, etc.)
2. Find the actual dimensions and weight from official sources
3. Convert all measurements:
   - Dimensions to inches (from cm: divide by 2.54, from mm: divide by 25.4)
   - Weight to pounds (from kg: multiply by 2.205, from grams: divide by 453.59)
4. Return null for any value you cannot find from a real source
5. For furniture, check if it can be disassembled (look for assembly requirements)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "name": "Simple item type only",
  "fullProductName": "Complete product name with all details",
  "dimensions": {
    "length": 70.875,
    "width": 16.5,
    "height": 15.375
  },
  "weight": 77,
  "description": "Comprehensive description with brand, model, materials, features",
  "category": "Furniture",
  "canDisassemble": true
}`;
};
