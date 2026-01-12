---
id: task-4.8
title: Extract detailed photo identification prompt
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:33'
labels:
  - prompts
  - photo-identification
  - extraction
dependencies:
  - task-4.2
  - task-4.4
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/photo-identification/detailed.ts` by extracting the "detailed" strategy prompt from `app/actions/identify-from-photo.ts:137-162`.

**Source prompt location:** Lines 137-162 in identify-from-photo.ts

**File structure:**
```typescript
import { z } from "zod";
import { confidenceLevels } from "../shared";
import type { PromptConfig } from "../types";

export const PROMPT_META: PromptConfig = {
  id: "photo-identification-detailed",
  version: "1.0.0",
  model: "openai/gpt-4o",
  maxTokens: 400,
  description: "Detailed photo analysis with brand/model detection",
  changelog: [{ version: "1.0.0", date: "2025-01-12", change: "Initial extraction" }],
};

export const outputSchema = z.object({
  productName: z.string(),
  fullProductName: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  needsManualReview: z.boolean(),
  clarificationQuestions: z.array(z.string()).optional(),
});

export interface DetailedPromptContext {
  userContext?: string;
}

export function buildPrompt(context: DetailedPromptContext): string {
  // Extract existing prompt logic
}
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompt extracted to dedicated file
- [ ] #2 Zod output schema defined
- [ ] #3 PromptConfig metadata included
- [ ] #4 buildPrompt function accepts context
- [ ] #5 User context injection works correctly
<!-- AC:END -->
