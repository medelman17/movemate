---
id: task-4.16
title: Create product-research index with exports
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:38'
labels:
  - prompts
  - product-research
dependencies:
  - task-4.13
  - task-4.14
  - task-4.15
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/product-research/index.ts` that exports all product research prompts:

```typescript
export * from "./types";
export { buildPrompt as buildUrlPrompt, PROMPT_META as URL_META } from "./url-based";
export { buildPrompt as buildSearchPrompt, PROMPT_META as SEARCH_META } from "./search-based";

// Helper to get prompt by mode
export function getResearchPrompt(mode: ResearchMode) {
  return mode === "url" 
    ? { build: buildUrlPrompt, config: URL_META }
    : { build: buildSearchPrompt, config: SEARCH_META };
}

// Convenience function matching current API
export function buildResearchPrompt(input: string, isUrl: boolean): string {
  return isUrl 
    ? buildUrlPrompt({ url: input }) 
    : buildSearchPrompt({ productName: input });
}
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All prompts re-exported
- [ ] #2 getResearchPrompt helper works
- [ ] #3 buildResearchPrompt convenience function available
- [ ] #4 TypeScript compilation passes
<!-- AC:END -->
