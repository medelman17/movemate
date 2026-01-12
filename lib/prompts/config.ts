import type { ModelConfig } from "./types";

/**
 * Centralized model configurations for all prompts.
 * Provides default settings for different AI models used across the application.
 */
export const modelConfigs = {
  /**
   * Vision model for photo analysis.
   * Used by: photo identification prompts
   * Note: Gemini 3 Flash offers ~70-80% cost savings vs GPT-4o with comparable quality
   */
  vision: {
    model: "google/gemini-3-flash",
    maxTokens: 400,
    temperature: 0.3,
  } satisfies ModelConfig,

  /**
   * Web search model for product research.
   * Used by: product research prompts
   */
  webSearch: {
    model: "perplexity/sonar-pro",
    maxTokens: 1000,
    temperature: 0.2,
  } satisfies ModelConfig,

  /**
   * Fast/cheap model for simple tasks.
   * Used by: name simplification and other utility prompts
   */
  fast: {
    model: "openai/gpt-4o-mini",
    maxTokens: 50,
    temperature: 0.1,
  } satisfies ModelConfig,
} as const;

/**
 * Model type names.
 */
export type ModelType = keyof typeof modelConfigs;

/**
 * Get model configuration by type.
 *
 * @param type - The model type
 * @returns Model configuration object
 *
 * @example
 * ```typescript
 * const visionConfig = getModelConfig("vision");
 * // { model: "openai/gpt-4o", maxTokens: 400, temperature: 0.3 }
 * ```
 */
export function getModelConfig(type: ModelType): ModelConfig {
  return modelConfigs[type];
}
