/**
 * Model configuration resolver.
 *
 * Provides a unified way to resolve model configuration with support for
 * environment variable overrides. This enables operational flexibility
 * (A/B testing, cost optimization) without code changes.
 *
 * Priority order:
 * 1. Runtime overrides (passed as argument)
 * 2. Environment variables (AI_<PROMPT_ID>_MODEL, AI_<PROMPT_ID>_MAX_TOKENS)
 * 3. PROMPT_META defaults
 */

import type { PromptConfig, ModelConfig } from "./types";

/**
 * Resolved model configuration ready for use in AI calls.
 */
export interface ResolvedModelConfig {
  /** Model identifier (e.g., "openai/gpt-4o") */
  model: string;
  /** Maximum tokens for response */
  maxTokens: number;
  /** Temperature for generation (0-1) */
  temperature?: number;
}

/**
 * Convert prompt ID to environment variable prefix.
 * e.g., "photo-identification-strategic" → "PHOTO_IDENTIFICATION_STRATEGIC"
 */
function toEnvPrefix(promptId: string): string {
  return promptId.replace(/-/g, "_").toUpperCase();
}

/**
 * Resolve model configuration from PROMPT_META with optional overrides.
 *
 * Environment variables checked:
 * - AI_<PREFIX>_MODEL: Override model identifier
 * - AI_<PREFIX>_MAX_TOKENS: Override max tokens
 * - AI_<PREFIX>_TEMPERATURE: Override temperature
 *
 * @param meta - Prompt configuration metadata (PROMPT_META)
 * @param overrides - Optional runtime overrides
 * @returns Resolved configuration ready for AI calls
 *
 * @example
 * ```typescript
 * import { STRATEGIC_META } from "@/lib/prompts";
 * import { resolveModelConfig } from "@/lib/prompts/resolve";
 *
 * const config = resolveModelConfig(STRATEGIC_META);
 * // Uses PROMPT_META values, unless AI_PHOTO_IDENTIFICATION_STRATEGIC_MODEL is set
 *
 * // With runtime override (e.g., for fallback on rate limit)
 * const fallbackConfig = resolveModelConfig(STRATEGIC_META, {
 *   model: "openai/gpt-4o-mini"
 * });
 * ```
 */
export function resolveModelConfig(
  meta: PromptConfig,
  overrides?: Partial<ModelConfig>
): ResolvedModelConfig {
  const prefix = toEnvPrefix(meta.id);

  // Check environment variables
  const envModel = process.env[`AI_${prefix}_MODEL`];
  const envMaxTokens = process.env[`AI_${prefix}_MAX_TOKENS`];
  const envTemperature = process.env[`AI_${prefix}_TEMPERATURE`];

  // Resolve with priority: overrides > env > meta
  const model = overrides?.model ?? envModel ?? meta.model;
  const maxTokens =
    overrides?.maxTokens ??
    (envMaxTokens ? parseInt(envMaxTokens, 10) : meta.maxTokens);
  const temperature =
    overrides?.temperature ??
    (envTemperature ? parseFloat(envTemperature) : undefined);

  return {
    model,
    maxTokens,
    ...(temperature !== undefined && { temperature }),
  };
}

/**
 * Get the environment variable names that would override a prompt's config.
 * Useful for documentation and debugging.
 *
 * @param meta - Prompt configuration metadata
 * @returns Object with environment variable names
 */
export function getEnvOverrideKeys(meta: PromptConfig): {
  model: string;
  maxTokens: string;
  temperature: string;
} {
  const prefix = toEnvPrefix(meta.id);
  return {
    model: `AI_${prefix}_MODEL`,
    maxTokens: `AI_${prefix}_MAX_TOKENS`,
    temperature: `AI_${prefix}_TEMPERATURE`,
  };
}
