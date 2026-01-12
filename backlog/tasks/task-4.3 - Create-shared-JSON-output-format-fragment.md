---
id: task-4.3
title: Create shared JSON output format fragment
status: Done
assignee: []
created_date: '2026-01-12 18:23'
updated_date: '2026-01-12 18:31'
labels:
  - prompts
  - shared
dependencies:
  - task-4.1
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/shared/output-format.ts` with reusable JSON output instructions:

```typescript
import { z } from "zod";

export function jsonOutputInstruction<T extends z.ZodTypeAny>(
  schema: T,
  options?: { includeExample?: boolean }
): string {
  // Generate human-readable schema description
  // Optionally include example output
}

export const jsonOnlyReminder = "Return ONLY valid JSON, no markdown, no code blocks, no additional text.";

export function wrapJsonResponse(schemaDescription: string): string {
  return `Return a JSON object with the following structure:
${schemaDescription}

${jsonOnlyReminder}`;
}
```

This fragment is used by all prompts that expect JSON responses.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 jsonOutputInstruction function works with Zod schemas
- [ ] #2 jsonOnlyReminder constant exported
- [ ] #3 wrapJsonResponse helper available
- [ ] #4 Exported from shared/index.ts
<!-- AC:END -->
