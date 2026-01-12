import { z } from "zod";

/**
 * Generates JSON output instructions from a Zod schema.
 *
 * Creates a human-readable description of the expected JSON structure
 * that can be embedded in prompts to guide AI model responses.
 *
 * @param schema - Zod schema defining the expected output structure
 * @returns Formatted instruction string for the prompt
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * const instruction = jsonOutputInstruction(schema);
 * // Returns: "Return a JSON object with: name (string), age (number)..."
 * ```
 */
export function jsonOutputInstruction<T extends z.ZodTypeAny>(_schema: T): string {
  // For now, return a simple instruction
  // Future enhancement: parse schema and generate detailed structure
  return `Return a valid JSON object matching the required schema.`;
}

/**
 * Standard reminder to output only JSON with no extra formatting.
 */
export const jsonOnlyReminder =
  "Return ONLY valid JSON, no markdown, no code blocks, no additional text.";

/**
 * Wraps schema description with JSON output formatting instructions.
 *
 * @param schemaDescription - Human-readable description of the schema
 * @returns Complete JSON output instruction block
 *
 * @example
 * ```typescript
 * const instruction = wrapJsonResponse(`{
 *   "name": "string",
 *   "confidence": "high|medium|low"
 * }`);
 * ```
 */
export function wrapJsonResponse(schemaDescription: string): string {
  return `Return a JSON object with the following structure:
${schemaDescription}

${jsonOnlyReminder}`;
}
