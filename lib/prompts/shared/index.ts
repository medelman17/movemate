/**
 * Shared prompt fragments and utilities.
 * These reusable components can be composed into domain-specific prompts.
 */

// Output formatting
export { jsonOutputInstruction, jsonOnlyReminder, wrapJsonResponse } from "./output-format";

// Confidence levels
export {
  confidenceLevels,
  confidenceLevelsCompact,
  confidenceThresholds,
  type ConfidenceLevel,
} from "./confidence-levels";

// Dimension conversion
export { dimensionConversionRules, dimensionFormat } from "./dimension-conversion";

// Moving context
export {
  movingInventoryContext,
  itemCategories,
  categoryExamples,
  type ItemCategory,
} from "./moving-context";
