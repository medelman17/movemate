import type { PromptConfig } from "@/lib/prompts/types";
import { STRATEGIC_META } from "@/lib/prompts/photo-identification";
import { URL_META, SEARCH_META } from "@/lib/prompts/product-research";
import { SIMPLIFY_NAME_META } from "@/lib/prompts/utilities";

/**
 * Telemetry context for building Vercel AI SDK telemetry configuration.
 */
export interface TelemetryContext {
  /** Prompt configuration from lib/prompts */
  promptConfig?: PromptConfig;
  /** User ID for tracking */
  userId?: string;
  /** Session ID for grouping related traces */
  sessionId?: string;
  /** Additional custom metadata */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Build telemetry configuration for Vercel AI SDK calls.
 * Maps our PromptConfig metadata to Langfuse-compatible attributes.
 */
export function buildTelemetry(context: TelemetryContext) {
  const { promptConfig, userId, sessionId, metadata } = context;

  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: promptConfig?.id ?? "unknown",
    metadata: {
      // Prompt metadata
      ...(promptConfig && {
        promptVersion: promptConfig.version,
        promptModel: promptConfig.model,
        promptMaxTokens: promptConfig.maxTokens,
      }),

      // User context
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),

      // Custom metadata
      ...metadata,
    },
  };
}

/**
 * Build telemetry for photo identification calls.
 * Derives prompt metadata from STRATEGIC_META for single source of truth.
 */
export function buildPhotoIdentificationTelemetry(options: {
  userId?: string;
  sessionId?: string;
  hasContext: boolean;
  hasAnswers: boolean;
  imageType: "base64" | "url";
  clarificationRound?: number;
}) {
  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: STRATEGIC_META.id,
    metadata: {
      // Prompt linking for Langfuse correlation (derived from PROMPT_META)
      promptName: STRATEGIC_META.id,
      promptVersion: STRATEGIC_META.version,
      promptModel: STRATEGIC_META.model,
      // Call context
      hasContext: options.hasContext,
      hasAnswers: options.hasAnswers,
      imageType: options.imageType,
      ...(options.clarificationRound !== undefined && {
        clarificationRound: options.clarificationRound,
      }),
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}

/**
 * Build telemetry for product research calls.
 * Derives prompt metadata from URL_META or SEARCH_META for single source of truth.
 */
export function buildProductResearchTelemetry(options: {
  userId?: string;
  sessionId?: string;
  isUrl: boolean;
  hasPhotoContext: boolean;
}) {
  const promptMeta = options.isUrl ? URL_META : SEARCH_META;

  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: promptMeta.id,
    metadata: {
      // Prompt linking for Langfuse correlation (derived from PROMPT_META)
      promptName: promptMeta.id,
      promptVersion: promptMeta.version,
      promptModel: promptMeta.model,
      // Call context
      isUrl: options.isUrl,
      hasPhotoContext: options.hasPhotoContext,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}

/**
 * Build telemetry for name simplification calls.
 * Derives prompt metadata from SIMPLIFY_NAME_META for single source of truth.
 */
export function buildSimplifyNameTelemetry(options: {
  userId?: string;
  sessionId?: string;
  originalNameLength: number;
}) {
  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: SIMPLIFY_NAME_META.id,
    metadata: {
      // Prompt linking for Langfuse correlation (derived from PROMPT_META)
      promptName: SIMPLIFY_NAME_META.id,
      promptVersion: SIMPLIFY_NAME_META.version,
      promptModel: SIMPLIFY_NAME_META.model,
      // Call context
      originalNameLength: options.originalNameLength,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}
