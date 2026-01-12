/**
 * Product research prompts for finding specifications via URLs or web search.
 *
 * Provides two modes:
 * - url: Fetches and analyzes a specific product page URL
 * - search: Searches the web for product specifications by name
 */

// Types and schemas
export * from "./types";

// Individual prompt builders and metadata
export { buildPrompt as buildUrlPrompt, PROMPT_META as URL_META } from "./url-based";

export { buildPrompt as buildSearchPrompt, PROMPT_META as SEARCH_META } from "./search-based";

// Re-import for helpers
import { buildPrompt as buildUrlPrompt } from "./url-based";
import { buildPrompt as buildSearchPrompt } from "./search-based";
import type { ResearchMode } from "./types";

/**
 * Helper to get prompt by research mode.
 *
 * @param mode - The research mode ("url" or "search")
 * @returns Prompt builder for the specified mode
 *
 * @example
 * ```typescript
 * const builder = getResearchPromptBuilder("url");
 * const prompt = builder({ url: "https://..." });
 * ```
 */
export function getResearchPromptBuilder(mode: ResearchMode) {
  return mode === "url" ? buildUrlPrompt : buildSearchPrompt;
}

/**
 * Convenience function matching current API.
 * Automatically determines whether input is a URL or search term.
 *
 * @param input - Product URL or search term
 * @param isUrl - Whether the input is a URL
 * @param photoContext - Optional rich context from photo identification
 * @returns The formatted prompt string
 *
 * @example
 * ```typescript
 * // URL mode
 * const urlPrompt = buildResearchPrompt("https://ikea.com/...", true);
 *
 * // Search mode
 * const searchPrompt = buildResearchPrompt("IKEA KALLAX white", false);
 *
 * // Search mode with photo context
 * const contextPrompt = buildResearchPrompt("Coffee Table", false, {
 *   features: ["Mid-century modern legs", "White marble top"],
 *   category: "Furniture",
 *   styleFamily: "Mid-Century Modern"
 * });
 * ```
 */
export function buildResearchPrompt(
  input: string,
  isUrl: boolean,
  photoContext?: import("./types").SearchResearchContext["photoContext"]
): string {
  return isUrl ? buildUrlPrompt({ url: input }) : buildSearchPrompt({ productName: input, photoContext });
}
