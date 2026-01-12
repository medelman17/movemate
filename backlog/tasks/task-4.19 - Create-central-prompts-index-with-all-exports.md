---
id: task-4.19
title: Create central prompts index with all exports
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - exports
dependencies:
  - task-4.7
  - task-4.12
  - task-4.16
  - task-4.18
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/index.ts` as the main entry point that re-exports everything:

```typescript
// Types
export * from "./types";

// Shared fragments
export * from "./shared";

// Domain-specific prompts
export * from "./photo-identification";
export * from "./product-research";
export * from "./utilities";

// Central registry of all prompts (for tooling/debugging)
export const promptRegistry = {
  photoIdentification: {
    detailed: DETAILED_META,
    visual: VISUAL_META,
    fallback: FALLBACK_META,
  },
  productResearch: {
    url: URL_META,
    search: SEARCH_META,
  },
  utilities: {
    simplifyName: SIMPLIFY_NAME_META,
  },
} as const;

// Helper to list all prompt versions
export function getAllPromptVersions() {
  return Object.entries(promptRegistry).flatMap(([domain, prompts]) =>
    Object.entries(prompts).map(([name, meta]) => ({
      domain,
      name,
      ...meta,
    }))
  );
}
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All prompts accessible via lib/prompts
- [ ] #2 promptRegistry provides metadata access
- [ ] #3 getAllPromptVersions helper works
- [ ] #4 No circular dependencies
<!-- AC:END -->
