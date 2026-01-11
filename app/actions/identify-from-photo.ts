"use server"

import { generateText } from "ai"

export async function identifyProductFromPhoto(imageUrl: string): Promise<string> {
  try {
    console.log("[v0] Analyzing product photo...")

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and identify the product. 

CRITICAL INSTRUCTIONS:
1. Identify the brand and model name if visible
2. If no brand/model is visible, describe the item type in detail
3. Return ONLY the product name/description, nothing else
4. Be specific - include brand, model number, color, or style if visible
5. Examples of good responses:
   - "IKEA Besta TV Unit in white"
   - "West Elm Mid-Century Coffee Table"
   - "Samsung 55-inch 4K Smart TV"
   - "Gray fabric sectional sofa"

Return ONLY the product name, no extra text:`,
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
      maxTokens: 100,
    })

    const productName = text.trim()
    console.log("[v0] Identified product:", productName)

    return productName
  } catch (error) {
    console.error("[v0] Error identifying product from photo:", error)
    throw new Error("Failed to identify product from photo")
  }
}
