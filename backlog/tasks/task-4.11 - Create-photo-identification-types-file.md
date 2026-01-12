---
id: task-4.11
title: Create photo-identification types file
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:33'
labels:
  - prompts
  - photo-identification
  - types
dependencies:
  - task-4.1
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/photo-identification/types.ts` with shared types for all photo identification prompts:

```typescript
import { z } from "zod";

// Shared output schema used by all strategies
export const identificationOutputSchema = z.object({
  productName: z.string().describe("Simple generic type"),
  fullProductName: z.string().describe("Detailed name with brand/model"),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  needsManualReview: z.boolean(),
  clarificationQuestions: z.array(z.string()).optional(),
});

export type IdentificationOutput = z.infer<typeof identificationOutputSchema>;

export type IdentificationStrategy = "detailed" | "visual" | "fallback";

export interface IdentificationContext {
  userContext?: string;
  previousAttempts?: number;
  hasAdditionalPhotos?: boolean;
}
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Shared output schema defined
- [ ] #2 IdentificationOutput type exported
- [ ] #3 IdentificationStrategy type exported
- [ ] #4 IdentificationContext interface defined
<!-- AC:END -->
