"use server";

import { generateObject, createGateway } from "ai";
import {
  buildStrategicPrompt,
  strategicIdentificationSchema,
  type StrategicIdentification,
  type ClarificationQuestion,
} from "@/lib/prompts/photo-identification";
import { buildPhotoIdentificationTelemetry } from "@/lib/langfuse/telemetry";
import { getActiveTraceId } from "@langfuse/tracing";

// Create Vercel AI Gateway instance
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

/**
 * V2: Strategic photo identification with single-pass analysis.
 *
 * This replaces the old 3-attempt approach with:
 * - Single GPT-4o vision call with structured output
 * - Smart questioning based on item analysis
 * - Always provides visual estimates as fallback
 * - 4x faster than V1 (single call vs 3 sequential)
 */

/**
 * Result from strategic identification.
 */
export interface StrategicIdentificationResult {
  /** Immediate identification if brand/model visible */
  identified?: {
    productName: string;
    fullProductName: string;
    confidence: "high" | "medium" | "low";
  };
  /** Strategic questions to ask for better identification */
  questions?: ClarificationQuestion[];
  /** Visual estimates (always provided) */
  estimates: {
    itemType: string;
    category: string;
    dimensions: { length: number | null; width: number | null; height: number | null };
    weight: number | null;
    canDisassemble: boolean | null;
  };
  /** Distinctive features observed */
  features: string[];
  /** Strategy being used */
  strategy: {
    approach: string;
    confidence: number;
    reasoning: string;
  };
  /** Langfuse trace ID for scoring (undefined if tracing disabled) */
  traceId?: string;
}

/**
 * Identifies a product from a photo using strategic questioning approach.
 *
 * @param imageUrl - URL of the uploaded image
 * @param userContext - Optional user-provided hints
 * @param previousAnswers - Answers to previous clarification questions
 * @returns Identification result with questions or immediate identification
 *
 * @example
 * ```typescript
 * // Initial call
 * const result = await identifyProductFromPhotoV2(imageUrl);
 * if (result.questions) {
 *   // Ask user questions
 *   const answers = await getUserAnswers(result.questions);
 *   // Call again with answers
 *   const final = await identifyProductFromPhotoV2(imageUrl, undefined, answers);
 * }
 * ```
 */
export async function identifyProductFromPhotoV2(
  imageUrl: string,
  userContext?: string,
  previousAnswers?: Record<string, string>
): Promise<StrategicIdentificationResult> {
  const startTime = Date.now();

  // Input validation
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Invalid image URL provided");
  }

  if (!imageUrl.startsWith("data:image/") && !imageUrl.startsWith("http")) {
    throw new Error("Image URL must be a data URI or HTTP(S) URL");
  }

  try {
    const imageType = imageUrl.startsWith("data:") ? "base64" : "url";

    console.log("[v2] Strategic photo identification started", {
      hasContext: !!userContext,
      hasAnswers: !!previousAnswers,
      imageType,
    });

    // Build prompt with context and answers
    const promptText = buildStrategicPrompt({ userContext, previousAnswers });

    // Build telemetry configuration for Langfuse
    const telemetry = buildPhotoIdentificationTelemetry({
      hasContext: !!userContext,
      hasAnswers: !!previousAnswers,
      imageType,
    });

    // Single structured call to vision model via Vercel AI Gateway
    const { object } = await generateObject({
      model: gateway("openai/gpt-4o"),
      schema: strategicIdentificationSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText,
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      maxOutputTokens: 800,
      temperature: 0.3,
      experimental_telemetry: telemetry,
    });

    const duration = Date.now() - startTime;
    const result = object as StrategicIdentification;

    // Capture trace ID for later scoring (may be undefined if tracing disabled)
    const traceId = getActiveTraceId();

    // Validate result structure
    if (!result.itemType || !result.category || !result.strategy) {
      console.error("[v2] Invalid response structure:", result);
      throw new Error("AI returned incomplete analysis. Please try again.");
    }

    console.log(`[v2] Analysis complete in ${duration}ms`, {
      itemType: result.itemType,
      strategy: result.strategy.approach,
      hasImmediateId: !!result.immediateIdentification,
      questionCount: result.strategy.questions.length,
      confidence: result.strategy.confidence,
    });

    // Transform to result format
    const output: StrategicIdentificationResult = {
      identified: result.immediateIdentification
        ? {
            productName: result.immediateIdentification.productName,
            fullProductName: result.immediateIdentification.fullProductName,
            confidence: result.immediateIdentification.confidence,
          }
        : undefined,
      questions:
        result.strategy.questions.length > 0 && !result.immediateIdentification
          ? result.strategy.questions
          : undefined,
      estimates: {
        itemType: result.itemType,
        category: result.category,
        dimensions: result.visualEstimates.dimensions,
        weight: result.visualEstimates.weight,
        canDisassemble: result.visualEstimates.canDisassemble,
      },
      features: result.distinctiveFeatures,
      strategy: {
        approach: result.strategy.approach,
        confidence: result.strategy.confidence,
        reasoning: result.strategy.reasoning,
      },
      traceId,
    };

    return output;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[v2] Error after ${duration}ms:`, error);

    // Classify error for better user feedback
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Rate limiting / quota exceeded
      if (message.includes("rate limit") || message.includes("too many requests") || message.includes("quota") || message.includes("insufficient_quota")) {
        throw new Error(
          "AI service is temporarily busy. Please wait a moment and try again."
        );
      }

      // Invalid image
      if (
        message.includes("invalid") ||
        message.includes("unsupported") ||
        message.includes("corrupt")
      ) {
        throw new Error(
          "Image appears to be invalid or corrupted. Please try a different photo."
        );
      }

      // Network/timeout
      if (message.includes("timeout") || message.includes("network") || message.includes("fetch")) {
        throw new Error(
          "Network error while analyzing photo. Please check your connection and try again."
        );
      }

      // API key/auth
      if (message.includes("unauthorized") || message.includes("forbidden") || message.includes("api key")) {
        console.error("[v2] Authentication error - check API configuration");
        throw new Error(
          "Service configuration error. Please contact support."
        );
      }

      // Schema validation error
      if (message.includes("schema") || message.includes("json_schema") || message.includes("required")) {
        console.error("[v2] Schema validation error - check Zod schema compatibility with OpenAI:", error);
        throw new Error(
          "AI configuration error. Please contact support."
        );
      }
    }

    // Generic fallback
    throw new Error("Failed to analyze photo. Please try again or enter details manually.");
  }
}

/**
 * Backward-compatible wrapper that returns the same format as V1.
 * This allows gradual migration without breaking existing UI.
 *
 * @param imageUrl - URL of the uploaded image
 * @param userContext - Optional user-provided hints
 * @returns Product name string or clarification request
 */
export async function identifyProductFromPhotoV2Compat(
  imageUrl: string,
  userContext?: string
): Promise<string | { needsClarification: true; questions: string[] }> {
  const result = await identifyProductFromPhotoV2(imageUrl, userContext);

  // If we have immediate identification with high confidence, return it
  if (result.identified && result.identified.confidence === "high") {
    return result.identified.fullProductName;
  }

  // If we have strategic questions, ask them
  if (result.questions && result.questions.length > 0) {
    return {
      needsClarification: true,
      questions: result.questions.map((q) => q.question),
    };
  }

  // If we have medium confidence identification, return it
  if (result.identified) {
    return result.identified.fullProductName;
  }

  // Last resort: return generic type with category
  return `${result.estimates.itemType} (${result.estimates.category})`;
}
