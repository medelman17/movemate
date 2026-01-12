"use server"

import { generateText } from "ai"

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
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a product name simplifier. Your job is to convert detailed product names into simple, generic item types suitable for a moving inventory.

RULES:
1. Remove all brand names (IKEA, Yaheetech, HOMCOM, etc.)
2. Remove model names/numbers (KALLAX, HEMNES, etc.)
3. Remove colors (white, dark blue, cream, etc.)
4. Remove dimensions and measurements
5. Remove material descriptions unless essential to the item type
6. Remove style descriptors (modern, vintage, velvet, etc.)
7. Keep only the core item type
8. Use title case
9. Keep it to 1-3 words maximum

EXAMPLES:
- "IKEA KALLAX Shelf unit, white, 77x147 cm" → "Shelf Unit"
- "Michigan Velvet Ottoman Dark Blue with Storage" → "Storage Ottoman"
- "Yaheetech 5-Tier Metal Bookshelf" → "Bookshelf"
- "HEMNES 8-drawer dresser, white stain, 63x37 3/8" → "Dresser"
- "Modern Tufted Velvet Accent Chair in Navy" → "Accent Chair"
- "42" Samsung Smart TV 4K UHD" → "TV"
- "KitchenAid Artisan 5-Quart Stand Mixer Red" → "Stand Mixer"

Return ONLY the simplified name, nothing else.`,
        },
        {
          role: "user",
          content: fullProductName,
        },
      ],
      maxTokens: 50,
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
