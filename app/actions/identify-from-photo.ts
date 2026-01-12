"use server"

import { generateText } from "ai"

interface IdentificationResult {
  productName: string
  fullProductName: string // Added to preserve detailed product name
  confidence: "high" | "medium" | "low"
  reasoning: string
  needsManualReview: boolean
  clarificationQuestions?: string[]
}

function simplifyProductName(fullName: string): string {
  // Remove brand names (common furniture brands)
  const brandPatterns = [
    /^IKEA\s+/i,
    /^KALLAX\s+/i,
    /^HEMNES\s+/i,
    /^REGISSÖR\s+/i,
    /^LAGKAPTEN\s+/i,
    /^HOMCOM\s+/i,
    /^Yaheetech\s+/i,
    /^Michigan\s+/i,
    /\s+by\s+[A-Z][a-z]+/gi,
    /^[A-Z][a-z]+\s+Velvet\s+/i,
  ]

  let simplified = fullName
  brandPatterns.forEach((pattern) => {
    simplified = simplified.replace(pattern, "")
  })

  // Remove measurements from the beginning
  simplified = simplified.replace(/^\d+[\d./"'\s-]*\s+/, "")

  // Remove specific colors/materials/styles in parentheses or at the end
  simplified = simplified.replace(/\s*$$[^)]+$$\s*/g, " ")
  simplified = simplified.replace(/\s*-\s*[A-Z][a-z]+\s*$/, "")

  // Remove extra descriptive words
  simplified = simplified
    .replace(/\s+(Golden Bronze|Dark Blue|Cream White)\s*/gi, " ")
    .replace(/\s+with\s+.*/i, "")
    .replace(/,\s+white$/i, "")
    .replace(/,\s+\d+x\d+.*$/i, "")

  // Clean up spacing
  simplified = simplified.replace(/\s+/g, " ").trim()

  // Capitalize first letter
  simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1)

  return simplified
}

export async function identifyProductFromPhoto(
  imageUrl: string,
  userContext?: string,
): Promise<string | { needsClarification: true; questions: string[] }> {
  try {
    console.log("[v0] Analyzing product photo...", userContext ? "with user context" : "")

    const hasAdditionalPhotos = userContext?.includes("additional photo")

    const firstAttempt = await attemptIdentification(imageUrl, "detailed", userContext)

    if (firstAttempt.confidence === "high") {
      console.log("[v0] High confidence identification:", firstAttempt.fullProductName)
      return firstAttempt.fullProductName
    }

    if (firstAttempt.clarificationQuestions && firstAttempt.clarificationQuestions.length > 0) {
      // If user already gave context but we still need help, AND they haven't uploaded extra photos yet
      if (userContext && !hasAdditionalPhotos) {
        console.log("[v0] User provided context but still unclear - requesting photos specifically")
        return {
          needsClarification: true,
          questions: [
            "Can you take another photo from a different angle?",
            "Is there a brand name or label visible from another side?",
          ],
        }
      }

      // First time asking for help
      if (!userContext) {
        console.log("[v0] Low confidence, requesting clarification from user")
        return {
          needsClarification: true,
          questions: firstAttempt.clarificationQuestions,
        }
      }
    }

    console.log("[v0] First attempt confidence low, trying alternative approach...")
    const secondAttempt = await attemptIdentification(imageUrl, "visual", userContext)

    if (secondAttempt.confidence === "high" || secondAttempt.confidence === "medium") {
      console.log("[v0] Second attempt successful:", secondAttempt.fullProductName)
      return secondAttempt.fullProductName
    }

    if (secondAttempt.clarificationQuestions && secondAttempt.clarificationQuestions.length > 0 && !userContext) {
      console.log("[v0] Second attempt needs clarification")
      return {
        needsClarification: true,
        questions: secondAttempt.clarificationQuestions,
      }
    }

    console.log("[v0] Attempting broad category identification...")
    const fallbackAttempt = await attemptIdentification(imageUrl, "fallback", userContext)

    if (fallbackAttempt.needsManualReview) {
      throw new Error("Image unclear - please enter product name manually")
    }

    console.log("[v0] Identified product:", fallbackAttempt.fullProductName)
    return fallbackAttempt.fullProductName
  } catch (error) {
    console.error("[v0] Error identifying product from photo:", error)
    throw new Error("Failed to identify product from photo")
  }
}

async function attemptIdentification(
  imageUrl: string,
  strategy: "detailed" | "visual" | "fallback",
  userContext?: string,
): Promise<IdentificationResult> {
  let promptText = ""

  const contextNote = userContext
    ? `\n\nUSER PROVIDED CONTEXT: ${userContext}\nUse this information to improve identification.`
    : ""

  if (strategy === "detailed") {
    promptText = `Analyze this image and identify the product with as much detail as possible.

CRITICAL INSTRUCTIONS:
1. Look for brand logos, labels, or model numbers
2. Identify specific product names if visible
3. Note distinctive features, colors, materials, style
4. If you see multiple items, focus on the main/largest item
5. Rate your confidence: HIGH (brand/model visible), MEDIUM (distinctive features), LOW (generic)
6. If confidence is LOW or MEDIUM, provide 2-3 clarification questions to ask the user

RETURN TWO NAMES:
- "productName": Simple generic type (e.g., "Coffee Table", "Shelf Unit", "Ottoman")
- "fullProductName": Detailed name with brand/model/specifics (e.g., "IKEA KALLAX Shelf unit, white", "Michigan Velvet Ottoman Dark Blue")

Return a JSON object with:
{
  "productName": "Simple generic type",
  "fullProductName": "Detailed name with brand/model/specifics",
  "confidence": "high|medium|low",
  "reasoning": "detailed explanation of what you see",
  "needsManualReview": false,
  "clarificationQuestions": ["question 1?", "question 2?"]
}

Return ONLY valid JSON, no other text.${contextNote}`
  } else if (strategy === "visual") {
    promptText = `Look at this image and describe what you see, focusing on the item type and characteristics.

INSTRUCTIONS:
1. Ignore any text/labels you can't read clearly
2. Focus on shape, size, material, color, style
3. Provide both simple and detailed names
4. Handle edge cases (blurry, multiple objects, partial visibility)

Return a JSON object:
{
  "productName": "Simple type (e.g., Bookshelf, Armchair)",
  "fullProductName": "Detailed description (e.g., Wooden Bookshelf with Glass Doors, Blue Velvet Armchair)",
  "confidence": "medium|low",
  "reasoning": "visual characteristics observed",
  "needsManualReview": false,
  "clarificationQuestions": ["helpful questions"]
}

Return ONLY valid JSON.${contextNote}`
  } else {
    promptText = `Identify the basic category of the item in this image.

Return JSON:
{
  "productName": "generic category",
  "fullProductName": "generic category with visible details",
  "confidence": "low",
  "reasoning": "explanation",
  "needsManualReview": true/false,
  "clarificationQuestions": []
}

Return ONLY valid JSON.${contextNote}`
  }

  const { text } = await generateText({
    model: "openai/gpt-4o",
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
    maxTokens: 400,
  })

  try {
    const cleanedText = text
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
    const result: IdentificationResult = JSON.parse(cleanedText)

    console.log(`[v0] ${strategy} attempt result:`, result)

    if (isGenericResponse(result.productName)) {
      console.log("[v0] Generic response detected, lowering confidence")
      result.confidence = "low"
      result.needsManualReview = true
    }

    return result
  } catch (parseError) {
    console.error("[v0] Failed to parse JSON response:", text)
    return {
      productName: text.trim().slice(0, 50),
      fullProductName: text.trim().slice(0, 100),
      confidence: "low",
      reasoning: "Unable to parse structured response",
      needsManualReview: true,
    }
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
  ]

  const lowerName = productName.toLowerCase()
  return genericPhrases.some((phrase) => lowerName.includes(phrase))
}
