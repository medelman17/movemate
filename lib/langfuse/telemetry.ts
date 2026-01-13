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
  const promptName = "photo-identification-strategic";
  const promptVersion = "2.0.0";

  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: promptName,
    metadata: {
      // Prompt linking for Langfuse correlation
      promptName,
      promptVersion,
      promptModel: "openai/gpt-4o",
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
 */
export function buildProductResearchTelemetry(options: {
  userId?: string;
  sessionId?: string;
  isUrl: boolean;
  hasPhotoContext: boolean;
}) {
  const promptName = options.isUrl ? "product-research-url" : "product-research-search";
  const promptVersion = "1.0.0";

  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: promptName,
    metadata: {
      // Prompt linking for Langfuse correlation
      promptName,
      promptVersion,
      promptModel: "perplexity/sonar-pro",
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
 */
export function buildSimplifyNameTelemetry(options: {
  userId?: string;
  sessionId?: string;
  originalNameLength: number;
}) {
  const promptName = "simplify-product-name";
  const promptVersion = "1.0.0";

  return {
    isEnabled: process.env.LANGFUSE_ENABLED === "true",
    functionId: promptName,
    metadata: {
      // Prompt linking for Langfuse correlation
      promptName,
      promptVersion,
      promptModel: "openai/gpt-4o-mini",
      // Call context
      originalNameLength: options.originalNameLength,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}
