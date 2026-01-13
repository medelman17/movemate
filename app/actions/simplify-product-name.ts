"use server"

import { generateText, createGateway } from "ai"
import { simplifyNameSystemPrompt, SIMPLIFY_NAME_META } from "@/lib/prompts/utilities"
import { resolveModelConfig } from "@/lib/prompts/resolve"
import { buildSimplifyNameTelemetry } from "@/lib/langfuse/telemetry"

// Create Vercel AI Gateway instance
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
})

/**
 * Simplifies a detailed product name into a clean, generic item type.
 * Uses AI to intelligently strip brand names, model numbers, colors,
 * dimensions, and other specifics while preserving the essential item type.
 *
 * @example
 * "IKEA KALLAX Shelf unit, white, 77x147 cm" → "Shelf Unit"
 * "Michigan Velvet Ottoman Dark Blue" → "Ottoman"
 * "Yaheetech 5-Tier Bookshelf with Metal Frame" → "Bookshelf"
 */
export async function simplifyProductName(fullProductName: string): Promise<string> {
  if (!fullProductName || fullProductName.trim().length === 0) {
    return "Unknown Item"
  }

  try {
    // Resolve model config (supports env overrides)
    const modelConfig = resolveModelConfig(SIMPLIFY_NAME_META)

    // Build telemetry configuration for Langfuse
    const telemetry = buildSimplifyNameTelemetry({
      originalNameLength: fullProductName.length,
    })

    const { text } = await generateText({
      model: gateway(modelConfig.model),
      messages: [
        {
          role: "system",
          content: simplifyNameSystemPrompt,
        },
        {
          role: "user",
          content: fullProductName,
        },
      ],
      maxOutputTokens: modelConfig.maxTokens,
      experimental_telemetry: telemetry,
    })

    const simplified = text.trim()

    // Fallback if AI returns empty or invalid response
    if (!simplified || simplified.length === 0 || simplified.length > 50) {
      console.warn("[simplifyProductName] AI returned invalid response, using fallback")
      return fallbackSimplify(fullProductName)
    }

    return simplified
  } catch (error) {
    console.error("[simplifyProductName] AI simplification failed:", error)
    return fallbackSimplify(fullProductName)
  }
}

/**
 * Simple regex-based fallback for when AI is unavailable
 */
function fallbackSimplify(fullName: string): string {
  const brandPatterns = [
    /^IKEA\s+/i,
    /^KALLAX\s+/i,
    /^HEMNES\s+/i,
    /^REGISSÖR\s+/i,
    /^LAGKAPTEN\s+/i,
    /^HOMCOM\s+/i,
    /^Yaheetech\s+/i,
    /^Samsung\s+/i,
    /^LG\s+/i,
    /^Sony\s+/i,
    /\s+by\s+[A-Z][a-z]+/gi,
  ]

  let simplified = fullName
  brandPatterns.forEach((pattern) => {
    simplified = simplified.replace(pattern, "")
  })

  // Remove measurements
  simplified = simplified.replace(/^\d+[\d./"'\s-]*\s+/, "")
  simplified = simplified.replace(/,\s+\d+x\d+.*$/i, "")

  // Remove content in parentheses
  simplified = simplified.replace(/\s*\([^)]+\)\s*/g, " ")

  // Remove trailing color/style
  simplified = simplified.replace(/\s*-\s*[A-Z][a-z]+\s*$/, "")
  simplified = simplified.replace(/,\s+\w+$/i, "")

  // Clean up
  simplified = simplified.replace(/\s+/g, " ").trim()

  // Title case
  simplified = simplified
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")

  return simplified || "Unknown Item"
}
