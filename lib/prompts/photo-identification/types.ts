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
  clarificationQuestions: z.array(z.string()).nullable().describe("Questions to ask user if unclear. Null if none needed."),
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

// ============================================================================
// NEW STRATEGIC IDENTIFICATION SCHEMAS (v2)
// ============================================================================

/**
 * Strategic approach for identifying the product.
 * Each strategy determines what questions to ask and how to proceed.
 */
export type IdentificationStrategyType =
  | "check_label" // Guide user to find physical label/tag
  | "purchase_history" // Ask where/when they bought it
  | "store_search" // Search retailer catalog with features
  | "feature_match" // Search by distinctive visual features
  | "use_estimates"; // Skip identification, use visual estimates

/**
 * Input type for clarification questions.
 */
export type QuestionInputType = "text" | "select" | "photo" | "date" | "number";

/**
 * A single clarification question with metadata.
 */
export const clarificationQuestionSchema = z.object({
  question: z.string().describe("The question to ask the user"),
  rationale: z
    .string()
    .describe("Why this question helps with identification (for debugging/logging)"),
  inputType: z
    .enum(["text", "select", "photo", "date", "number"])
    .describe("Type of input expected from user"),
  options: z
    .array(z.string())
    .nullable()
    .describe("For 'select' type: available options. Null if not applicable."),
  placeholder: z.string().nullable().describe("Placeholder text for text inputs. Null if not applicable."),
});

export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;

/**
 * Identification strategy with questions to ask.
 */
export const identificationStrategySchema = z.object({
  approach: z
    .enum(["check_label", "purchase_history", "store_search", "feature_match", "use_estimates"])
    .describe("Strategic approach to identification"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence in the chosen strategy (0-1)"),
  reasoning: z.string().describe("Why this strategy was chosen"),
  questions: z
    .array(clarificationQuestionSchema)
    .max(3)
    .describe("Up to 3 strategic questions to ask"),
});

export type IdentificationStrategy2 = z.infer<typeof identificationStrategySchema>;

/**
 * Visual estimates as fallback when identification is uncertain.
 */
export const visualEstimatesSchema = z.object({
  dimensions: z.object({
    length: z.number().nullable().describe("Estimated length in inches"),
    width: z.number().nullable().describe("Estimated width in inches"),
    height: z.number().nullable().describe("Estimated height in inches"),
  }),
  weight: z.number().nullable().describe("Estimated weight in pounds"),
  canDisassemble: z.boolean().nullable().describe("Whether item can be disassembled"),
  notes: z.string().nullable().describe("Additional visual observations. Null if none."),
});

export type VisualEstimates = z.infer<typeof visualEstimatesSchema>;

/**
 * Complete structured output from strategic photo identification (v2).
 * This replaces the old multi-attempt approach with a single comprehensive call.
 */
export const strategicIdentificationSchema = z.object({
  // Basic identification from photo
  itemType: z.string().describe("Generic item type (e.g., 'Sofa', 'Bookshelf', 'Coffee Table')"),
  category: z
    .enum([
      "Furniture",
      "Electronics",
      "Kitchenware",
      "Clothing",
      "Books",
      "Decor",
      "Tools",
      "Appliances",
      "Other",
    ])
    .describe("Item category for moving inventory"),

  // Visual characteristics
  distinctiveFeatures: z
    .array(z.string())
    .describe("Distinctive visual features (color, material, style, unique elements)"),
  styleFamily: z.string().nullable().describe("Design style (e.g., 'Mid-Century Modern', 'Industrial'). Null if unclear."),

  // Visual estimates (always provided as fallback)
  visualEstimates: visualEstimatesSchema,

  // Strategic approach
  strategy: identificationStrategySchema,

  // Immediate identification (if possible from photo alone)
  immediateIdentification: z
    .object({
      productName: z.string().describe("Simple generic type"),
      fullProductName: z.string().describe("Detailed name with brand/model if visible"),
      confidence: z.enum(["high", "medium", "low"]),
    })
    .nullable()
    .describe("Immediate identification if brand/model visible in photo. Null if uncertain."),
});

export type StrategicIdentification = z.infer<typeof strategicIdentificationSchema>;

/**
 * Context for building strategic identification prompts.
 */
export interface StrategicIdentificationContext {
  /** User-provided description or hints */
  userContext?: string;
  /** Answers to previous clarification questions */
  previousAnswers?: Record<string, string>;
  /** Current clarification round (0-indexed). When >= 1, this is the final round. */
  clarificationRound?: number;
}
