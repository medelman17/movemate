/**
 * Model Configuration Architecture
 *
 * This module documents the model configuration system. Individual prompts
 * define their own model settings in PROMPT_META, and the resolver supports
 * environment variable overrides for operational flexibility.
 *
 * ## Configuration Hierarchy
 *
 * 1. **PROMPT_META** (authoritative): Each prompt defines its model, maxTokens,
 *    and version in its own file (e.g., strategic.ts exports STRATEGIC_META)
 *
 * 2. **Environment Overrides**: Runtime overrides via environment variables:
 *    - AI_<PROMPT_ID>_MODEL: Override model identifier
 *    - AI_<PROMPT_ID>_MAX_TOKENS: Override max tokens
 *    - AI_<PROMPT_ID>_TEMPERATURE: Override temperature
 *
 * 3. **resolveModelConfig()**: Utility in resolve.ts that merges these sources
 *
 * ## Current Prompt Configurations
 *
 * | Prompt | Model | Tokens | Env Prefix |
 * |--------|-------|--------|------------|
 * | photo-identification-strategic | openai/gpt-4o | 800 | AI_PHOTO_IDENTIFICATION_STRATEGIC |
 * | product-research-url | perplexity/sonar-pro | 1000 | AI_PRODUCT_RESEARCH_URL |
 * | product-research-search | perplexity/sonar-pro | 1000 | AI_PRODUCT_RESEARCH_SEARCH |
 * | simplify-product-name | openai/gpt-4o-mini | 50 | AI_SIMPLIFY_PRODUCT_NAME |
 *
 * ## Example: Override Photo ID Model
 *
 * ```bash
 * # In .env.local - use cheaper model for development
 * AI_PHOTO_IDENTIFICATION_STRATEGIC_MODEL=openai/gpt-4o-mini
 * AI_PHOTO_IDENTIFICATION_STRATEGIC_MAX_TOKENS=400
 * ```
 *
 * ## Supported Models (via Vercel AI Gateway)
 *
 * Vision:
 * - openai/gpt-4o (default for photo ID - best quality)
 * - google/gemini-3-flash (70-80% cheaper, good quality)
 * - openai/gpt-4o-mini (cheapest, adequate for simple items)
 *
 * Web Search:
 * - perplexity/sonar-pro (best for product research)
 * - perplexity/sonar (cheaper alternative)
 *
 * Fast/Utility:
 * - openai/gpt-4o-mini (default for simple tasks)
 *
 * @see resolve.ts for the resolveModelConfig() function
 * @see Each prompt's PROMPT_META for authoritative configuration
 */

// Re-export types used by the configuration system
export type { ModelConfig, PromptConfig } from "./types";
