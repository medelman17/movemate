import { z } from "zod";

/**
 * Product information schema for research results.
 * This schema is used by both URL-based and search-based research prompts.
 */
export const productInfoSchema = z.object({
  name: z.string().describe("Simple generic item name for moving manifest"),
  fullProductName: z.string().describe("Full detailed product name with brand/model/specifics"),
  dimensions: z
    .object({
      length: z.number().nullable().describe("Length in inches"),
      width: z.number().nullable().describe("Width in inches"),
      height: z.number().nullable().describe("Height in inches"),
    })
    .describe("Product dimensions"),
  weight: z.number().nullable().describe("Weight in pounds"),
  description: z
    .string()
    .nullable()
    .describe("Detailed product description including brand, model, materials, features"),
  category: z
    .enum(["Furniture", "Electronics", "Kitchenware", "Clothing", "Books", "Decor", "Tools", "Other"])
    .nullable()
    .describe("Best matching category"),
  canDisassemble: z.boolean().nullable().describe("Whether the item can be disassembled for moving"),
});

/**
 * Type derived from the product info schema.
 */
export type ProductInfo = z.infer<typeof productInfoSchema>;

/**
 * Research mode types.
 */
export type ResearchMode = "url" | "search";

/**
 * Context for URL-based research.
 */
export interface UrlResearchContext {
  url: string;
}

/**
 * Context for search-based research.
 */
export interface SearchResearchContext {
  productName: string;
  /** Optional rich context from photo identification */
  photoContext?: {
    /** Distinctive visual features observed */
    features?: string[];
    /** Item category from photo analysis */
    category?: string;
    /** Visual dimension estimates in inches */
    estimatedDimensions?: {
      length: number | null;
      width: number | null;
      height: number | null;
    };
    /** Visual weight estimate in pounds */
    estimatedWeight?: number | null;
    /** Style family (e.g., "Mid-Century Modern") */
    styleFamily?: string;
  };
}

/**
 * Generic research context.
 */
export interface ResearchContext {
  input: string;
  mode: ResearchMode;
}
