"use server"

import { generateText } from "ai"

interface IdentificationResult {
  productName: string
  confidence: "high" | "medium" | "low"
  reasoning: string
  needsManualReview: boolean
  clarificationQuestions?: string[]
}

export async function identifyProductFromPhoto(
  imageUrl: string,
  userContext?: string,
): Promise<string | { needsClarification: true; questions: string[] }> {
  try {
    console.log("[v0] Analyzing product photo...", userContext ? "with user context" : "")

    const firstAttempt = await attemptIdentification(imageUrl, "detailed", userContext)

    if (firstAttempt.confidence === "high") {
      console.log("[v0] High confidence identification:", firstAttempt.productName)
      return firstAttempt.productName
    }

    if (firstAttempt.clarificationQuestions && firstAttempt.clarificationQuestions.length > 0 && !userContext) {
      console.log("[v0] Low confidence, requesting clarification from user")
      return {
        needsClarification: true,
        questions: firstAttempt.clarificationQuestions,
      }
    }

    console.log("[v0] First attempt confidence low, trying alternative approach...")
    const secondAttempt = await attemptIdentification(imageUrl, "visual", userContext)

    if (secondAttempt.confidence === "high" || secondAttempt.confidence === "medium") {
      console.log("[v0] Second attempt successful:", secondAttempt.productName)
      return secondAttempt.productName
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

    console.log("[v0] Identified product:", fallbackAttempt.productName)
    return fallbackAttempt.productName
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

Return a JSON object with:
{
  "productName": "specific product name",
  "confidence": "high|medium|low",
  "reasoning": "why you identified it this way",
  "needsManualReview": false,
  "clarificationQuestions": ["question 1?", "question 2?"]
}

Clarification question examples:
- "Can you see a brand name or logo on this item?"
- "Is this from IKEA, Wayfair, or another furniture retailer?"
- "What room is this item in or intended for?"
- "Do you remember where you purchased this item?"

Examples of GOOD high-confidence responses:
- "IKEA Kallax Shelf Unit in white"
- "Samsung 55-inch Frame TV"
- "Herman Miller Aeron Office Chair"

Examples of MEDIUM confidence:
- "Modern gray fabric sectional sofa"
- "Wooden mid-century coffee table with tapered legs"

Return ONLY valid JSON, no other text.${contextNote}`
  } else if (strategy === "visual") {
    promptText = `Look at this image and describe what you see, focusing on the item type and characteristics.

INSTRUCTIONS:
1. Ignore any text/labels you can't read clearly
2. Focus on shape, size, material, color, style
3. Describe the item type and distinctive features
4. Handle edge cases:
   - Blurry image: describe general category
   - Multiple objects: describe the largest/central one
   - Partial visibility: describe what you can see
5. If uncertain, provide clarification questions

Return a JSON object:
{
  "productName": "descriptive product name",
  "confidence": "medium|low",
  "reasoning": "visual characteristics observed",
  "needsManualReview": false,
  "clarificationQuestions": ["helpful questions"]
}

Example clarification questions:
- "Is this a bookshelf or entertainment center?"
- "What material is this made of - wood, metal, or plastic?"
- "Approximately how tall is this item in feet?"

Example responses:
- "Large wooden bookshelf with 5 shelves"
- "Beige upholstered armchair"
- "Stainless steel dining table"

Return ONLY valid JSON.${contextNote}`
  } else {
    // fallback strategy
    promptText = `Identify the basic category of the item in this image.

INSTRUCTIONS:
1. What TYPE of item is this? (furniture, appliance, decor, etc.)
2. If image is too blurry or unclear, set needsManualReview: true
3. If multiple items and unclear which is main, set needsManualReview: true
4. Otherwise provide a generic but useful description

Return JSON:
{
  "productName": "generic category description",
  "confidence": "low",
  "reasoning": "explanation",
  "needsManualReview": true/false,
  "clarificationQuestions": []
}

Examples:
- "Furniture item - appears to be storage unit"
- "Kitchen appliance"
- Image unclear: needsManualReview: true

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
      productName: text.trim().slice(0, 100),
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
