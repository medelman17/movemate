"use server"

import { generateText, generateObject, createGateway } from "ai"
import { z } from "zod"
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

/**
 * Schema for extracting product info from unstructured research text.
 * Uses descriptions to guide the extraction model.
 */
const extractionSchema = z.object({
  name: z.string().describe("Simple generic item name for moving manifest (e.g., 'Stand Mixer', 'Coffee Table')"),
  fullProductName: z.string().describe("Full product name with brand and model (e.g., 'KitchenAid Artisan Series 5-Qt Stand Mixer')"),
  dimensions: z.object({
    length: z.number().nullable().describe("Length/depth in inches, null if not found"),
    width: z.number().nullable().describe("Width in inches, null if not found"),
    height: z.number().nullable().describe("Height in inches, null if not found"),
  }).describe("Product dimensions in inches"),
  weight: z.number().nullable().describe("Weight in pounds, null if not found"),
  description: z.string().nullable().describe("Brief product description with key features and materials"),
  category: z.enum(["Furniture", "Electronics", "Kitchenware", "Clothing", "Books", "Decor", "Tools", "Other"]).describe("Best matching category for this item"),
  canDisassemble: z.boolean().nullable().describe("Whether the item can be disassembled for moving, null if unclear"),
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
  const startTime = Date.now()
  const isProductURL = isURL(input)

  aiLogger.info({ input, isUrl: isProductURL, hasPhotoContext: !!photoContext }, "Research input")

  try {
    // Step 1: Use Perplexity to search the web for product information
    const prompt = buildResearchPrompt(input, isProductURL, photoContext)
    const promptMeta = isProductURL ? URL_META : SEARCH_META
    const modelConfig = resolveModelConfig(promptMeta)

    const telemetry = buildProductResearchTelemetry({
      isUrl: isProductURL,
      hasPhotoContext: !!photoContext,
    })

    aiLogger.debug({ model: modelConfig.model }, "Starting web research with Perplexity")

    const { text: researchText } = await generateText({
      model: gateway(modelConfig.model),
      prompt,
      maxOutputTokens: modelConfig.maxTokens,
      experimental_telemetry: telemetry,
    })

    aiLogger.debug({ responseLength: researchText.length }, "Perplexity research complete")

    // Step 2: Use OpenAI to extract structured data from the research text
    // This is more reliable than regex-based JSON parsing
    aiLogger.debug("Extracting structured data with GPT-5-mini")

    const { object: extracted } = await generateObject({
      model: gateway("openai/gpt-5-mini"),
      schema: extractionSchema,
      prompt: `Extract product information from this research data about "${input}".

RESEARCH DATA:
${researchText}

INSTRUCTIONS:
- Extract the product name, dimensions (in inches), weight (in pounds), and other details
- For dimensions, convert from cm (÷ 2.54) or mm (÷ 25.4) to inches if needed
- For weight, convert from kg (× 2.205) to pounds if needed
- Use null for any values not found in the research
- The "name" should be a simple generic type (e.g., "Stand Mixer", "Bookshelf")
- The "fullProductName" should include brand, model, and specifics`,
      maxOutputTokens: 500,
      temperature: 0.1,
    })

    // Simplify the name if it's too specific
    const simplifiedName = extracted.name.length > 30
      ? await simplifyProductName(extracted.name)
      : extracted.name

    const result = productInfoSchema.parse({
      name: simplifiedName,
      fullProductName: extracted.fullProductName,
      dimensions: extracted.dimensions,
      weight: extracted.weight,
      description: extracted.description,
      category: extracted.category,
      canDisassemble: extracted.canDisassemble,
    })

    const duration = Date.now() - startTime
    aiLogger.info(
      { name: result.name, category: result.category, durationMs: duration },
      "Successfully extracted product info"
    )

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    aiLogger.error({ error, durationMs: duration }, "Error researching product")

    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes("rate limit") || message.includes("quota")) {
        throw new Error("AI service is temporarily busy. Please try again in a moment.")
      }

      if (message.includes("timeout") || message.includes("network")) {
        throw new Error("Network error during research. Please check your connection.")
      }

      if (message.includes("unauthorized") || message.includes("api key")) {
        aiLogger.error({ error }, "Authentication error - check API configuration")
        throw new Error("Service configuration error. Please contact support.")
      }
    }

    throw new Error("Failed to research product information. Please try again or enter details manually.")
  }
}
