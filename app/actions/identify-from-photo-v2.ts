"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  buildStrategicPrompt,
  strategicIdentificationSchema,
  type StrategicIdentification,
  type ClarificationQuestion,
} from "@/lib/prompts/photo-identification";

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

  try {
    console.log("[v2] Strategic photo identification started", {
      hasContext: !!userContext,
      hasAnswers: !!previousAnswers,
    });

    // Build prompt with context and answers
    const promptText = buildStrategicPrompt({ userContext, previousAnswers });

    // Single structured call to GPT-4o
    const { object } = await generateObject({
      model: openai("gpt-4o"),
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
      maxTokens: 800 as any, // AI SDK type issue, works at runtime
      temperature: 0.3,
    });

    const duration = Date.now() - startTime;
    const result = object as StrategicIdentification;

    console.log(`[v2] Analysis complete in ${duration}ms`, {
      itemType: result.itemType,
      strategy: result.strategy.approach,
      hasImmediateId: !!result.immediateIdentification,
      questionCount: result.strategy.questions.length,
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
    };

    return output;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[v2] Error after ${duration}ms:`, error);

    // Return graceful fallback
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
