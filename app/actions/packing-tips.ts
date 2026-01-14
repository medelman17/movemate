"use server"

import { generateText, createGateway } from "ai"
import { buildPrompt, BEST_PRACTICES_META, type PackingTipsContext } from "@/lib/prompts/packing-tips"
import { resolveModelConfig } from "@/lib/prompts/resolve"
import { aiLogger } from "@/lib/logger"
import { z } from "zod"

// Create Vercel AI Gateway instance
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
})

/**
 * Schema for packing tips response.
 */
export const packingTipsSchema = z.object({
  tips: z.array(z.string()).min(3).max(6),
  materials: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
})

export type PackingTips = z.infer<typeof packingTipsSchema>

/**
 * Researches best practices and tips for moving/storing an item.
 *
 * Uses Perplexity AI to search the web for expert moving and storage advice
 * specific to the item type, category, and characteristics.
 *
 * @param context - Item details for contextual research
 * @returns Structured packing tips with materials and warnings
 *
 * @example
 * ```typescript
 * const tips = await getPackingTips({
 *   itemName: "Coffee Table",
 *   category: "Furniture",
 *   canDisassemble: true
 * });
 * ```
 */
export async function getPackingTips(context: PackingTipsContext): Promise<PackingTips> {
  try {
    aiLogger.info({ itemName: context.itemName, category: context.category }, "Researching packing tips")

    const prompt = buildPrompt(context)

    // Resolve model config (supports env overrides)
    const modelConfig = resolveModelConfig(BEST_PRACTICES_META)

    const { text } = await generateText({
      model: gateway(modelConfig.model),
      prompt,
      maxOutputTokens: modelConfig.maxTokens,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "packing-tips",
        metadata: {
          itemName: context.itemName,
          category: context.category || "unknown",
          hasDescription: !!context.description,
        },
      },
    })

    aiLogger.debug({ responseLength: text.length }, "Perplexity response received")

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      aiLogger.error({ response: text }, "No JSON found in response")
      throw new Error("Could not parse AI response - no JSON found")
    }

    const parsedData = JSON.parse(jsonMatch[0])
    const result = packingTipsSchema.parse(parsedData)

    aiLogger.info({ tipCount: result.tips.length, materialCount: result.materials.length }, "Successfully parsed packing tips")

    return result
  } catch (error) {
    aiLogger.error({ error }, "Error researching packing tips")
    throw new Error("Failed to research packing tips")
  }
}
