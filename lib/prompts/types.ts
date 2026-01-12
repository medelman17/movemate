/**
 * Core types for the prompt management system.
 * These types provide structure and metadata for all AI prompts.
 */

/**
 * Configuration metadata for a prompt.
 * Tracks version, model requirements, and changelog.
 */
export interface PromptConfig {
  /** Unique identifier for the prompt (e.g., "photo-identification-detailed") */
  id: string;
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  /** Model identifier (e.g., "openai/gpt-4o", "perplexity/sonar-pro") */
  model: string;
  /** Maximum tokens for model response */
  maxTokens: number;
  /** Human-readable description of what this prompt does */
  description: string;
  /** Version history with changes */
  changelog: Array<{
    version: string;
    date: string;
    change: string;
  }>;
}

/**
 * Generic prompt builder function type.
 *
 * @template TContext - Optional context object type for dynamic prompt generation
 *
 * @example
 * ```typescript
 * // No context needed
 * const buildSimple: PromptBuilder = () => "Simple prompt";
 *
 * // With context
 * interface MyContext { userName: string; }
 * const buildWithContext: PromptBuilder<MyContext> = (ctx) => `Hello ${ctx.userName}`;
 * ```
 */
export type PromptBuilder<TContext = void> = TContext extends void
  ? () => string
  : (context: TContext) => string;

/**
 * Model configuration including runtime parameters.
 */
export interface ModelConfig {
  /** Model identifier */
  model: string;
  /** Maximum tokens for response */
  maxTokens: number;
  /** Optional temperature (0-1, higher = more creative) */
  temperature?: number;
}

/**
 * Photo identification strategy types.
 */
export type PromptStrategy = "detailed" | "visual" | "fallback";

/**
 * Product research mode types.
 */
export type ResearchMode = "url" | "search";
