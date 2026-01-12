---
id: task-4.12
title: Create photo-identification index with exports
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:33'
labels:
  - prompts
  - photo-identification
dependencies:
  - task-4.8
  - task-4.9
  - task-4.10
  - task-4.11
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/photo-identification/index.ts` that exports all photo identification prompts and provides a unified interface:

```typescript
// Re-export individual prompts
export * from "./types";
export { buildPrompt as buildDetailedPrompt, PROMPT_META as DETAILED_META } from "./detailed";
export { buildPrompt as buildVisualPrompt, PROMPT_META as VISUAL_META } from "./visual";
export { buildPrompt as buildFallbackPrompt, PROMPT_META as FALLBACK_META } from "./fallback";

// Strategy registry for programmatic access
export const photoIdentificationPrompts = {
  detailed: { build: buildDetailedPrompt, config: DETAILED_META },
  visual: { build: buildVisualPrompt, config: VISUAL_META },
  fallback: { build: buildFallbackPrompt, config: FALLBACK_META },
} as const;

// Helper to get prompt by strategy
export function getPhotoPrompt(strategy: IdentificationStrategy) {
  return photoIdentificationPrompts[strategy];
}
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All prompts re-exported
- [ ] #2 Strategy registry available
- [ ] #3 getPhotoPrompt helper works
- [ ] #4 TypeScript compilation passes
<!-- AC:END -->
