/**
 * Central exports for all AI prompts.
 *
 * This is the main entry point for the prompt management system.
 * All prompts are organized by domain and can be accessed through this index.
 */

// Core types and utilities
export * from "./types";
export * from "./config";
export * from "./resolve";

// Shared prompt fragments
export * from "./shared";

// Domain-specific prompts
export * from "./photo-identification";
export * from "./product-research";
export * from "./utilities";

// Re-import for registry
import {
  DETAILED_META,
  VISUAL_META,
  FALLBACK_META,
  STRATEGIC_META,
} from "./photo-identification";
import { URL_META, SEARCH_META } from "./product-research";
import { SIMPLIFY_NAME_META } from "./utilities";

/**
 * Central registry of all prompts with their metadata.
 * Useful for tooling, debugging, and version tracking.
 */
export const promptRegistry = {
  photoIdentification: {
    strategic: STRATEGIC_META, // V2 (recommended)
    detailed: DETAILED_META, // V1 legacy
    visual: VISUAL_META, // V1 legacy
    fallback: FALLBACK_META, // V1 legacy
  },
  productResearch: {
    url: URL_META,
    search: SEARCH_META,
  },
  utilities: {
    simplifyName: SIMPLIFY_NAME_META,
  },
} as const;

/**
 * Helper to list all prompt versions for debugging/tooling.
 *
 * @returns Array of all prompts with their metadata
 *
 * @example
 * ```typescript
 * const allPrompts = getAllPromptVersions();
 * allPrompts.forEach(p => {
 *   console.log(`${p.domain}/${p.name} v${p.version} - ${p.model}`);
 * });
 * ```
 */
export function getAllPromptVersions() {
  return Object.entries(promptRegistry).flatMap(([domain, prompts]) =>
    Object.entries(prompts).map(([name, meta]) => ({
      domain,
      name,
      ...meta,
    }))
  );
}
