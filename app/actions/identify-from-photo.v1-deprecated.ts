"use server";

/**
 * @deprecated This file contains the V1 multi-attempt photo identification approach.
 *
 * **DO NOT USE THIS FILE**
 *
 * V1 Issues:
 * - 10-20 second response time (3 sequential GPT-4o calls)
 * - Generic clarification questions
 * - Manual JSON parsing with error handling complexity
 * - Fallback strategy cascade
 *
 * **Use V2 instead**: app/actions/identify-from-photo-v2.ts
 *
 * V2 Benefits:
 * - <4 second response time (single GPT-4o call)
 * - Strategic questioning based on item analysis
 * - Structured output with generateObject
 * - Always-provided visual estimates
 *
 * This file is kept temporarily for reference during migration.
 * Will be removed once V2 is validated in production.
 *
 * Migration date: 2026-01-12
 */

import { generateText } from "ai";
import { getPhotoPrompt } from "@/lib/prompts/photo-identification";

/**
 * V1 DEPRECATED - See file header for migration instructions.
 *
 * Here, a user takes a picture of some item in their apartment, like a couch,
 * tv, chair, etc., uploads it via our application to be included on move manifest,
 * and we try to figure out, with as much precision as possible,
 * what it is, so that we can then search for its weight, dimensions, etc.
 */

interface IdentificationResult {
  productName: string;
  fullProductName: string; // Added to preserve detailed product name
  confidence: "high" | "medium" | "low";
  reasoning: string;
  needsManualReview: boolean;
  clarificationQuestions?: string[];
}

export async function identifyProductFromPhoto(
  imageUrl: string,
  userContext?: string
): Promise<string | { needsClarification: true; questions: string[] }> {
  try {
    console.log(
      "[v0] Analyzing product photo...",
      userContext ? "with user context" : ""
    );

    const hasAdditionalPhotos = userContext?.includes("additional photo");

    const firstAttempt = await attemptIdentification(
      imageUrl,
      "detailed",
      userContext
    );

    if (firstAttempt.confidence === "high") {
      console.log(
        "[v0] High confidence identification:",
        firstAttempt.fullProductName
      );
      return firstAttempt.fullProductName;
    }

    if (
      firstAttempt.clarificationQuestions &&
      firstAttempt.clarificationQuestions.length > 0
    ) {
      // If user already gave context but we still need help, AND they haven't uploaded extra photos yet
      if (userContext && !hasAdditionalPhotos) {
        console.log(
          "[v0] User provided context but still unclear - requesting photos specifically"
        );
        return {
          needsClarification: true,
          questions: [
            "Can you take another photo from a different angle?",
            "Is there a brand name or label visible from another side?",
          ],
        };
      }

      // First time asking for help
      if (!userContext) {
        console.log("[v0] Low confidence, requesting clarification from user");
        return {
          needsClarification: true,
          questions: firstAttempt.clarificationQuestions,
        };
      }
    }

    console.log(
      "[v0] First attempt confidence low, trying alternative approach..."
    );
    const secondAttempt = await attemptIdentification(
      imageUrl,
      "visual",
      userContext
    );

    if (
      secondAttempt.confidence === "high" ||
      secondAttempt.confidence === "medium"
    ) {
      console.log(
        "[v0] Second attempt successful:",
        secondAttempt.fullProductName
      );
      return secondAttempt.fullProductName;
    }

    if (
      secondAttempt.clarificationQuestions &&
      secondAttempt.clarificationQuestions.length > 0 &&
      !userContext
    ) {
      console.log("[v0] Second attempt needs clarification");
      return {
        needsClarification: true,
        questions: secondAttempt.clarificationQuestions,
      };
    }

    console.log("[v0] Attempting broad category identification...");
    const fallbackAttempt = await attemptIdentification(
      imageUrl,
      "fallback",
      userContext
    );

    if (fallbackAttempt.needsManualReview) {
      throw new Error("Image unclear - please enter product name manually");
    }

    console.log("[v0] Identified product:", fallbackAttempt.fullProductName);
    return fallbackAttempt.fullProductName;
  } catch (error) {
    console.error("[v0] Error identifying product from photo:", error);
    throw new Error("Failed to identify product from photo");
  }
}

async function attemptIdentification(
  imageUrl: string,
  strategy: "detailed" | "visual" | "fallback",
  userContext?: string
): Promise<IdentificationResult> {
  // Get prompt builder and config for the strategy
  const { build, config } = getPhotoPrompt(strategy);
  const promptText = build({ userContext });

  const { text } = await generateText({
    model: config.model as any, // Provider-specific model string
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
    maxOutputTokens: config.maxTokens,
  });

  try {
    const cleanedText = text
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
    const result: IdentificationResult = JSON.parse(cleanedText);

    console.log(`[v0] ${strategy} attempt result:`, result);

    if (isGenericResponse(result.productName)) {
      console.log("[v0] Generic response detected, lowering confidence");
      result.confidence = "low";
      result.needsManualReview = true;
    }

    return result;
  } catch (parseError) {
    console.error("[v0] Failed to parse JSON response:", text);
    return {
      productName: text.trim().slice(0, 50),
      fullProductName: text.trim().slice(0, 100),
      confidence: "low",
      reasoning: "Unable to parse structured response",
      needsManualReview: true,
    };
  }
}

function isGenericResponse(productName: string): boolean {
  const genericPhrases = [
    "product",
    "item",
    "object",
    "thing",
    "furniture piece",
    "I cannot identify",
    "unable to determine",
    "unclear",
    "cannot see",
  ];

  const lowerName = productName.toLowerCase();
  return genericPhrases.some((phrase) => lowerName.includes(phrase));
}
