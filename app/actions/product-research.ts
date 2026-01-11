"use server"

import { generateText } from "ai"
import { z } from "zod"

const productInfoSchema = z.object({
  name: z.string().describe("The full product name"),
  dimensions: z
    .object({
      length: z.number().nullable().describe("Length in inches"),
      width: z.number().nullable().describe("Width in inches"),
      height: z.number().nullable().describe("Height in inches"),
    })
    .describe("Product dimensions"),
  weight: z.number().nullable().describe("Weight in pounds"),
  description: z.string().nullable().describe("Brief product description"),
  category: z
    .enum(["Furniture", "Electronics", "Kitchenware", "Clothing", "Books", "Decor", "Tools", "Other"])
    .nullable()
    .describe("Best matching category"),
  canDisassemble: z.boolean().nullable().describe("Whether the item can be disassembled for moving"),
})

export type ProductInfo = z.infer<typeof productInfoSchema>

function isURL(text: string): boolean {
  try {
    const url = new URL(text)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export async function researchProduct(input: string): Promise<ProductInfo> {
  try {
    const isProductURL = isURL(input)

    console.log("[v0] Research input:", input, "Is URL:", isProductURL)

    const prompt = isProductURL
      ? `Fetch and analyze the product page at this URL: ${input}

Your task is to extract the product information directly from this webpage.

CRITICAL INSTRUCTIONS:
1. Visit the URL and extract the product name from the page title or product heading
2. Find the dimensions and weight from the product specifications on the page
3. Convert all measurements:
   - Dimensions to inches (from cm: divide by 2.54, from mm: divide by 25.4)
   - Weight to pounds (from kg: multiply by 2.205, from grams: divide by 453.59)
4. Return null for any value you cannot find on the page
5. For furniture, check if it can be disassembled (look for assembly requirements)
6. Extract the ACTUAL product name (not the URL)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "name": "Full product name extracted from the page",
  "dimensions": {
    "length": 70.875,
    "width": 16.5,
    "height": 15.375
  },
  "weight": 77,
  "description": "Brief description from the product page",
  "category": "Furniture",
  "canDisassemble": true
}`
      : `Search the web for accurate product specifications for: "${input}"

Your task is to find the REAL specifications from manufacturer websites, retailers, or product listings.

CRITICAL INSTRUCTIONS:
1. Search for the exact product name on manufacturer websites (IKEA, Amazon, etc.)
2. Find the actual dimensions and weight from official sources
3. Convert all measurements:
   - Dimensions to inches (from cm: divide by 2.54, from mm: divide by 25.4)
   - Weight to pounds (from kg: multiply by 2.205, from grams: divide by 453.59)
4. Return null for any value you cannot find from a real source
5. For furniture, check if it can be disassembled (look for assembly requirements)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "name": "Full product name",
  "dimensions": {
    "length": 70.875,
    "width": 16.5,
    "height": 15.375
  },
  "weight": 77,
  "description": "Brief description from manufacturer",
  "category": "Furniture",
  "canDisassemble": true
}`

    const { text } = await generateText({
      model: "perplexity/sonar-pro",
      prompt,
      maxTokens: 1000,
    })

    console.log("[v0] Perplexity Response:", text)

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] No JSON found in response:", text)
      throw new Error("Could not parse AI response - no JSON found")
    }

    const parsedData = JSON.parse(jsonMatch[0])

    // Validate and normalize the data
    const result = productInfoSchema.parse({
      name: parsedData.name || input,
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
