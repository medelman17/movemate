"use server"

import { generateText, createGateway } from "ai"
import { simplifyProductName } from "./simplify-product-name"
import {
  buildResearchPrompt,
  productInfoSchema,
  URL_META,
  SEARCH_META,
  type ProductInfo,
} from "@/lib/prompts/product-research"
import { resolveModelConfig } from "@/lib/prompts/resolve"
import { buildProductResearchTelemetry } from "@/lib/langfuse/telemetry"
import { aiLogger } from "@/lib/logger"

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

    aiLogger.info({ input, isUrl: isProductURL, hasPhotoContext: !!photoContext }, "Research input")

    const prompt = buildResearchPrompt(input, isProductURL, photoContext)

    // Resolve model config based on research mode (supports env overrides)
    const promptMeta = isProductURL ? URL_META : SEARCH_META
    const modelConfig = resolveModelConfig(promptMeta)

    // Build telemetry configuration for Langfuse
    const telemetry = buildProductResearchTelemetry({
      isUrl: isProductURL,
      hasPhotoContext: !!photoContext,
    })

    const { text } = await generateText({
      model: gateway(modelConfig.model),
      prompt,
      maxOutputTokens: modelConfig.maxTokens,
      experimental_telemetry: telemetry,
    })

    aiLogger.debug({ responseLength: text.length }, "Perplexity response received")

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      aiLogger.error({ response: text }, "No JSON found in response")
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

    aiLogger.info({ name: result.name, category: result.category }, "Successfully parsed product info")

    return result
  } catch (error) {
    aiLogger.error({ error }, "Error researching product")
    throw new Error("Failed to research product information")
  }
}
