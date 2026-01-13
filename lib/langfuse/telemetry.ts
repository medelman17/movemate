import type { PromptConfig } from "@/lib/prompts/types";

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
    functionId: "photo-identification-strategic",
    metadata: {
      promptVersion: "2.0.0",
      promptModel: "openai/gpt-4o",
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
 */
export function buildProductResearchTelemetry(options: {
  userId?: string;
  sessionId?: string;
  isUrl: boolean;
  hasPhotoContext: boolean;
}) {
  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: "product-research",
    metadata: {
      promptModel: "perplexity/sonar-pro",
      isUrl: options.isUrl,
      hasPhotoContext: options.hasPhotoContext,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}

/**
 * Build telemetry for name simplification calls.
 */
export function buildSimplifyNameTelemetry(options: {
  userId?: string;
  sessionId?: string;
  originalNameLength: number;
}) {
  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: "simplify-product-name",
    metadata: {
      promptModel: "openai/gpt-4o-mini",
      originalNameLength: options.originalNameLength,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}
