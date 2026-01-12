"use server"

import { generateText } from "ai"
import { z } from "zod"
import { simplifyProductName } from "./simplify-product-name"

const productInfoSchema = z.object({
  name: z.string().describe("Simple generic item name for moving manifest"),
  fullProductName: z.string().describe("Full detailed product name with brand/model"),
  dimensions: z
    .object({
      length: z.number().nullable().describe("Length in inches"),
      width: z.number().nullable().describe("Width in inches"),
      height: z.number().nullable().describe("Height in inches"),
    })
    .describe("Product dimensions"),
  weight: z.number().nullable().describe("Weight in pounds"),
  description: z
    .string()
    .nullable()
    .describe("Detailed product description including brand, model, materials, features"),
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
1. Extract TWO names:
   - "name": Simple generic type for moving manifest (e.g., "Coffee Table", "Shelf Unit", "Ottoman")
   - "fullProductName": Complete product name with brand, model, color, size (e.g., "IKEA KALLAX Shelf unit, white, 57 7/8x57 7/8"")

2. Create a detailed description that includes:
   - Full brand and model information
   - Materials, colors, style details
   - Key features and specifications
   - Any unique identifiers

Examples:
Input: IKEA KALLAX page
- name: "Shelf Unit"
- fullProductName: "IKEA KALLAX Shelf unit, white, 57 7/8x57 7/8""
- description: "Modern cube storage shelf from IKEA's KALLAX series in white finish. Features 16 square compartments arranged in 4x4 grid. Made of particleboard with white melamine coating. Can be used vertically or horizontally."

DIMENSION AND WEIGHT INSTRUCTIONS:
1. Find the dimensions and weight from the product specifications on the page
2. Convert all measurements:
   - Dimensions to inches (from cm: divide by 2.54, from mm: divide by 25.4)
   - Weight to pounds (from kg: multiply by 2.205, from grams: divide by 453.59)
3. Return null for any value you cannot find on the page
4. For furniture, check if it can be disassembled (look for assembly requirements)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "name": "Simple item type only",
  "fullProductName": "Complete product name with all details",
  "dimensions": {
    "length": 70.875,
    "width": 16.5,
    "height": 15.375
  },
  "weight": 77,
  "description": "Comprehensive description with brand, model, materials, features",
  "category": "Furniture",
  "canDisassemble": true
}`
      : `Search the web for accurate product specifications for: "${input}"

Your task is to find the REAL specifications from manufacturer websites, retailers, or product listings.

CRITICAL INSTRUCTIONS:
1. Extract TWO names:
   - "name": Simple generic type for moving manifest (e.g., "Coffee Table", "TV Stand", "Floor Lamp")
   - "fullProductName": Complete product name with brand, model, specifics (e.g., "IKEA Besta TV Unit, white, 47 1/4x15 3/4x15"")

2. Create a detailed description that includes:
   - Full brand and model information
   - Materials, colors, finish, style
   - Key features and characteristics
   - Size information if relevant to description

Examples:
Search: "Michigan Velvet Ottoman Dark Blue"
- name: "Ottoman"
- fullProductName: "Michigan Velvet Ottoman (Dark Blue)"
- description: "Upholstered ottoman from Michigan furniture collection featuring dark blue velvet fabric. Round shape with button-tufted top and wooden legs."

DIMENSION AND WEIGHT INSTRUCTIONS:
1. Search for the exact product name on manufacturer websites (IKEA, Amazon, etc.)
2. Find the actual dimensions and weight from official sources
3. Convert all measurements:
   - Dimensions to inches (from cm: divide by 2.54, from mm: divide by 25.4)
   - Weight to pounds (from kg: multiply by 2.205, from grams: divide by 453.59)
4. Return null for any value you cannot find from a real source
5. For furniture, check if it can be disassembled (look for assembly requirements)

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just JSON):
{
  "name": "Simple item type only",
  "fullProductName": "Complete product name with all details",
  "dimensions": {
    "length": 70.875,
    "width": 16.5,
    "height": 15.375
  },
  "weight": 77,
  "description": "Comprehensive description with brand, model, materials, features",
  "category": "Furniture",
  "canDisassemble": true
}`

    const { text } = await generateText({
      model: "perplexity/sonar-pro",
      prompt,
      maxTokens: 1000,
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
