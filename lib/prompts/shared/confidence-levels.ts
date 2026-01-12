/**
 * Confidence level guidelines for AI identification tasks.
 * Use this in prompts to standardize how models should rate their confidence.
 */
export const confidenceLevels = `CONFIDENCE LEVELS:
- HIGH: Brand name, model number, or distinctive identifiers clearly visible
- MEDIUM: Recognizable style, materials, or features but no specific identifiers
- LOW: Generic category only, needs user clarification`;

/**
 * Compact version of confidence guidelines for token-limited prompts.
 */
export const confidenceLevelsCompact = `Rate confidence: HIGH (identifiers visible), MEDIUM (distinctive features), LOW (generic only)`;

/**
 * Confidence level type.
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Numeric thresholds for confidence levels (for future scoring systems).
 */
export const confidenceThresholds = {
  high: 0.85,
  medium: 0.6,
  low: 0.3,
} as const;
