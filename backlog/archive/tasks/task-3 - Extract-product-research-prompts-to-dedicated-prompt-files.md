---
id: task-3
title: Extract product research prompts to dedicated prompt files
status: To Do
assignee: []
created_date: '2026-01-12 18:06'
labels:
  - refactor
  - dx
  - prompts
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The large prompt strings in `app/actions/product-research.ts:46-136` should be extracted to a dedicated location for better maintainability.

**Current state:** Two ~45-line prompt templates inline in the function:
1. URL-based product research prompt (fetches from product page)
2. Search-based product research prompt (searches web for specs)

**Problems with inline prompts:**
- Hard to read and maintain
- Difficult to version/compare changes
- Can't easily A/B test different prompts
- Mixed concerns (logic + content)

**Proposed structure:**
```
lib/prompts/
  index.ts              # Re-exports all prompts
  product-research.ts   # Product research prompts
  identify-from-photo.ts # Photo identification prompts (for task-1)
```

Or alternatively, co-locate with actions:
```
app/actions/
  product-research.ts
  product-research.prompts.ts
```

Each prompt file exports typed prompt builder functions:
```typescript
export function buildUrlResearchPrompt(url: string): string { ... }
export function buildSearchResearchPrompt(productName: string): string { ... }
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompts extracted to dedicated file(s)
- [ ] #2 Prompt builder functions are typed
- [ ] #3 Original file imports and uses extracted prompts
- [ ] #4 Consistent pattern established for other prompts in codebase
- [ ] #5 Prompts are easier to read and modify
<!-- AC:END -->
