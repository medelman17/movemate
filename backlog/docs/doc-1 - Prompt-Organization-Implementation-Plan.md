---
id: doc-1
title: Prompt Organization Implementation Plan
type: other
created_date: '2026-01-12 18:23'
---
# Prompt Organization Implementation Plan

## Executive Summary

This plan refactors all AI prompts from inline strings scattered across server actions into a centralized, typed, versioned prompt management system in `lib/prompts/`.

**Current State:**
- 6 prompts across 3 files, all inline
- No version tracking, no testing, no composition
- ~1,400 tokens of prompt content embedded in business logic

**Target State:**
- Centralized `lib/prompts/` directory with typed prompt builders
- Shared fragments for common instructions
- Zod schemas co-located with prompts
- Metadata for versioning and model configuration
- Unit-testable prompt generation

---

## Architecture Design

### Directory Structure

```
lib/
└── prompts/
    ├── index.ts                      # Central registry & exports
    ├── types.ts                      # Shared TypeScript types
    ├── schemas.ts                    # All Zod schemas (co-located)
    ├── config.ts                     # Model configs, defaults
    ├── shared/
    │   ├── index.ts                  # Shared fragment exports
    │   ├── output-format.ts          # JSON output instructions
    │   ├── confidence-levels.ts      # Confidence rating guidelines
    │   ├── dimension-conversion.ts   # Metric/imperial conversion rules
    │   └── moving-context.ts         # Moving inventory domain context
    ├── photo-identification/
    │   ├── index.ts                  # Exports all photo prompts
    │   ├── types.ts                  # Photo-specific types
    │   ├── detailed.ts               # Detailed strategy prompt
    │   ├── visual.ts                 # Visual strategy prompt
    │   ├── fallback.ts               # Fallback strategy prompt
    │   └── unified.ts                # Future: single-pass prompt (task-1.2)
    ├── product-research/
    │   ├── index.ts                  # Exports all research prompts
    │   ├── types.ts                  # Research-specific types
    │   ├── url-based.ts              # URL scraping prompt
    │   └── search-based.ts           # Web search prompt
    └── utilities/
        ├── index.ts                  # Utility prompt exports
        └── simplify-name.ts          # Name simplification prompt
```

### Prompt File Structure (Template)

Each prompt file follows this consistent structure:

```typescript
// lib/prompts/photo-identification/detailed.ts

import { z } from "zod";
import { jsonOutputInstruction } from "../shared/output-format";
import { confidenceLevels } from "../shared/confidence-levels";
import type { PromptConfig, PromptBuilder } from "../types";

// ============================================
// METADATA
// ============================================
export const PROMPT_META: PromptConfig = {
  id: "photo-identification-detailed",
  version: "1.0.0",
  model: "openai/gpt-4o",
  maxTokens: 400,
  description: "Detailed photo analysis with brand/model detection",
  changelog: [
    { version: "1.0.0", date: "2025-01-12", change: "Initial extraction from inline" },
  ],
};

// ============================================
// OUTPUT SCHEMA
// ============================================
export const outputSchema = z.object({
  productName: z.string().describe("Simple generic type (e.g., 'Coffee Table')"),
  fullProductName: z.string().describe("Detailed name with brand/model/specifics"),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string().describe("Detailed explanation of identification"),
  needsManualReview: z.boolean(),
  clarificationQuestions: z.array(z.string()).optional(),
});

export type DetailedIdentificationOutput = z.infer<typeof outputSchema>;

// ============================================
// PROMPT BUILDER
// ============================================
export interface DetailedPromptContext {
  userContext?: string;
}

export const buildPrompt: PromptBuilder<DetailedPromptContext> = (context) => {
  const contextNote = context.userContext
    ? `\n\nUSER PROVIDED CONTEXT: ${context.userContext}\nUse this information to improve identification.`
    : "";

  return `Analyze this image and identify the product with as much detail as possible.

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

${confidenceLevels}

${jsonOutputInstruction(outputSchema)}

Return ONLY valid JSON, no other text.${contextNote}`;
};
```

---

## Shared Fragments

### output-format.ts
```typescript
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function jsonOutputInstruction<T extends z.ZodTypeAny>(schema: T): string {
  const jsonSchema = zodToJsonSchema(schema, { errorMessages: true });
  return `Return a JSON object matching this schema:
${JSON.stringify(jsonSchema, null, 2)}`;
}

export const jsonOnlyReminder = "Return ONLY valid JSON, no markdown, no code blocks.";
```

### confidence-levels.ts
```typescript
export const confidenceLevels = `CONFIDENCE LEVELS:
- HIGH: Brand name, model number, or distinctive identifiers clearly visible
- MEDIUM: Recognizable style, materials, or features but no specific identifiers
- LOW: Generic category only, needs user clarification`;
```

### dimension-conversion.ts
```typescript
export const dimensionConversionRules = `DIMENSION AND WEIGHT CONVERSION:
1. Convert all measurements to inches:
   - From cm: divide by 2.54
   - From mm: divide by 25.4
2. Convert weight to pounds:
   - From kg: multiply by 2.205
   - From grams: divide by 453.59
3. Return null for any value you cannot determine`;
```

---

## Type Definitions

### types.ts
```typescript
export interface PromptConfig {
  id: string;
  version: string;
  model: string;
  maxTokens: number;
  description: string;
  changelog: Array<{
    version: string;
    date: string;
    change: string;
  }>;
}

export type PromptBuilder<TContext = void> = TContext extends void
  ? () => string
  : (context: TContext) => string;

export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature?: number;
}
```

---

## Migration Strategy

### Phase 1: Foundation (lib/prompts core)
1. Create directory structure
2. Define shared types and interfaces
3. Create shared fragments
4. Set up central exports

### Phase 2: Extract Photo Identification Prompts
1. Extract detailed strategy prompt
2. Extract visual strategy prompt
3. Extract fallback strategy prompt
4. Update identify-from-photo.ts to import prompts
5. Verify functionality unchanged

### Phase 3: Extract Product Research Prompts
1. Extract URL-based research prompt
2. Extract search-based research prompt
3. Update product-research.ts to import prompts
4. Verify functionality unchanged

### Phase 4: Extract Utility Prompts
1. Extract name simplification prompt
2. Update simplify-product-name.ts to import prompts
3. Verify functionality unchanged

### Phase 5: Polish & Documentation
1. Add JSDoc comments to all exports
2. Create usage examples
3. Update CLAUDE.md with prompt conventions
4. Clean up old inline prompts

---

## Integration Pattern

After refactoring, server actions will look like:

```typescript
// app/actions/identify-from-photo.ts
import { 
  buildDetailedPrompt, 
  buildVisualPrompt,
  buildFallbackPrompt,
  DETAILED_CONFIG,
  VISUAL_CONFIG,
  FALLBACK_CONFIG,
} from "@/lib/prompts/photo-identification";

async function attemptIdentification(
  imageUrl: string,
  strategy: "detailed" | "visual" | "fallback",
  userContext?: string
): Promise<IdentificationResult> {
  const promptBuilders = {
    detailed: { build: buildDetailedPrompt, config: DETAILED_CONFIG },
    visual: { build: buildVisualPrompt, config: VISUAL_CONFIG },
    fallback: { build: buildFallbackPrompt, config: FALLBACK_CONFIG },
  };

  const { build, config } = promptBuilders[strategy];
  const promptText = build({ userContext });

  const { text } = await generateText({
    model: config.model,
    messages: [
      { role: "user", content: [{ type: "text", text: promptText }, { type: "image", image: imageUrl }] },
    ],
    maxTokens: config.maxTokens,
  });

  // ... rest of function
}
```

---

## Testing Strategy

### Unit Tests for Prompts
```typescript
// __tests__/lib/prompts/photo-identification/detailed.test.ts
import { buildPrompt, outputSchema, PROMPT_META } from "@/lib/prompts/photo-identification/detailed";

describe("detailed photo identification prompt", () => {
  it("generates prompt without context", () => {
    const prompt = buildPrompt({});
    expect(prompt).toContain("CRITICAL INSTRUCTIONS");
    expect(prompt).not.toContain("USER PROVIDED CONTEXT");
  });

  it("injects user context when provided", () => {
    const prompt = buildPrompt({ userContext: "This is my couch" });
    expect(prompt).toContain("USER PROVIDED CONTEXT: This is my couch");
  });

  it("has valid output schema", () => {
    expect(() => outputSchema.parse({
      productName: "Couch",
      fullProductName: "IKEA KIVIK Sofa",
      confidence: "high",
      reasoning: "Brand visible",
      needsManualReview: false,
    })).not.toThrow();
  });

  it("has required metadata", () => {
    expect(PROMPT_META.id).toBeDefined();
    expect(PROMPT_META.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(PROMPT_META.model).toBeDefined();
  });
});
```

---

## Success Criteria

1. All prompts extracted to `lib/prompts/`
2. Zero behavior changes in existing functionality
3. Each prompt has:
   - Typed builder function
   - Co-located Zod schema
   - Metadata with version info
4. Shared fragments eliminate duplication
5. Server actions import prompts cleanly
6. Unit tests cover prompt generation
7. Documentation updated
