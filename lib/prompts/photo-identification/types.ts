import { z } from "zod";

/**
 * Shared output schema used by all photo identification strategies.
 */
export const identificationOutputSchema = z.object({
  productName: z.string().describe("Simple generic type (e.g., 'Coffee Table', 'Ottoman')"),
  fullProductName: z
    .string()
    .describe("Detailed name with brand/model/specifics (e.g., 'IKEA KALLAX Shelf unit, white')"),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string().describe("Detailed explanation of identification"),
  needsManualReview: z.boolean(),
  clarificationQuestions: z.array(z.string()).optional(),
});

/**
 * Type derived from the identification output schema.
 */
export type IdentificationOutput = z.infer<typeof identificationOutputSchema>;

/**
 * Available photo identification strategies.
 */
export type IdentificationStrategy = "detailed" | "visual" | "fallback";

/**
 * Context passed to identification prompt builders.
 */
export interface IdentificationContext {
  /** User-provided description or hints about the item */
  userContext?: string;
  /** Number of previous identification attempts (for logging/strategy selection) */
  previousAttempts?: number;
  /** Whether user has already uploaded additional photos */
  hasAdditionalPhotos?: boolean;
}
