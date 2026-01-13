"use server"

import { generateText, createGateway } from "ai"
import { simplifyProductName } from "./simplify-product-name"
import { buildResearchPrompt, productInfoSchema, type ProductInfo } from "@/lib/prompts/product-research"
import { buildProductResearchTelemetry } from "@/lib/langfuse/telemetry"

// Create Vercel AI Gateway instance
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
})

export type { ProductInfo }

function isURL(text: string): boolean {
  try {
    const url = new URL(text)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export async function researchProduct(
  input: string,
  photoContext?: {
    features?: string[];
    category?: string;
    estimatedDimensions?: {
      length: number | null;
      width: number | null;
      height: number | null;
    };
    estimatedWeight?: number | null;
    styleFamily?: string;
  }
): Promise<ProductInfo> {
  try {
    const isProductURL = isURL(input)

    console.log("[v0] Research input:", input, "Is URL:", isProductURL, "Has photo context:", !!photoContext)

    const prompt = buildResearchPrompt(input, isProductURL, photoContext)

    // Build telemetry configuration for Langfuse
    const telemetry = buildProductResearchTelemetry({
      isUrl: isProductURL,
      hasPhotoContext: !!photoContext,
    })

    const { text } = await generateText({
      model: gateway("perplexity/sonar-pro"),
      prompt,
      maxOutputTokens: 1000,
      experimental_telemetry: telemetry,
    })

    console.log("[v0] Perplexity Response:", text)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] No JSON found in response:", text)
      throw new Error("Could not parse AI response - no JSON found")
    }

    const parsedData = JSON.parse(jsonMatch[0])

    // Use AI to simplify product name if not provided
    const simplifiedName = parsedData.name || (await simplifyProductName(parsedData.fullProductName || input))

    const result = productInfoSchema.parse({
      name: simplifiedName,
      fullProductName: parsedData.fullProductName || input,
      dimensions: {
        length: typeof parsedData.dimensions?.length === "number" ? parsedData.dimensions.length : null,
        width: typeof parsedData.dimensions?.width === "number" ? parsedData.dimensions.width : null,
        height: typeof parsedData.dimensions?.height === "number" ? parsedData.dimensions.height : null,
      },
      weight: typeof parsedData.weight === "number" ? parsedData.weight : null,
      description: parsedData.description || null,
      category: parsedData.category || "Other",
      canDisassemble: typeof parsedData.canDisassemble === "boolean" ? parsedData.canDisassemble : null,
    })

    console.log("[v0] Successfully parsed product info:", result)

    return result
  } catch (error) {
    console.error("[v0] Error researching product:", error)
    throw new Error("Failed to research product information")
  }
}
