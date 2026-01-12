import { dimensionConversionRules } from "../shared";
import type { PromptConfig, PromptBuilder } from "../types";
import type { UrlResearchContext } from "./types";

/**
 * Metadata for the URL-based product research prompt.
 */
export const PROMPT_META: PromptConfig = {
  id: "product-research-url",
  version: "1.0.0",
  model: "perplexity/sonar-pro",
  maxTokens: 1000,
  description: "Fetches and analyzes product information from a given URL",
  changelog: [
    {
      version: "1.0.0",
      date: "2026-01-12",
      change: "Initial extraction from inline prompt in product-research.ts",
    },
  ],
};

/**
 * Builds the URL-based product research prompt.
 *
 * This prompt instructs the AI to fetch and analyze a product page URL,
 * extracting specifications, dimensions, weight, and other details.
 *
 * @param context - Context containing the product URL
 * @returns The formatted prompt string ready for the research model
 *
 * @example
 * ```typescript
 * const prompt = buildPrompt({ url: "https://www.ikea.com/us/en/p/kallax-shelf-unit-white-80275887/" });
 * ```
 */
export const buildPrompt: PromptBuilder<UrlResearchContext> = (context) => {
  return `Fetch and analyze the product page at this URL: ${context.url}

Your task is to extract the product information directly from this webpage.

CRITICAL INSTRUCTIONS:
1. Extract TWO names:
   - "name": Simple generic type for moving manifest (e.g., "Coffee Table", "Shelf Unit", "Ottoman")
   - "fullProductName": Complete product name with brand, model, color, size (e.g., "IKEA KALLAX Shelf unit, white, 57 7/8x57 7/8"")

2. Create a detailed description that includes:
   - Full brand and model information
   - Materials, colors, style details
   - Key features and specifications
   - Any unique identifiers

Examples:
Input: IKEA KALLAX page
- name: "Shelf Unit"
- fullProductName: "IKEA KALLAX Shelf unit, white, 57 7/8x57 7/8""
- description: "Modern cube storage shelf from IKEA's KALLAX series in white finish. Features 16 square compartments arranged in 4x4 grid. Made of particleboard with white melamine coating. Can be used vertically or horizontally."

${dimensionConversionRules}

DIMENSION AND WEIGHT INSTRUCTIONS:
1. Find the dimensions and weight from the product specifications on the page
2. Convert all measurements:
   - Dimensions to inches (from cm: divide by 2.54, from mm: divide by 25.4)
   - Weight to pounds (from kg: multiply by 2.205, from grams: divide by 453.59)
3. Return null for any value you cannot find on the page
4. For furniture, check if it can be disassembled (look for assembly requirements)

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
