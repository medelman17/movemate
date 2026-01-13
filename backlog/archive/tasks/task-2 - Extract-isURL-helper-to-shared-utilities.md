---
id: task-2
title: Extract isURL helper to shared utilities
status: To Do
assignee: []
created_date: '2026-01-12 18:04'
labels:
  - refactor
  - cleanup
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The `isURL` helper function in `app/actions/product-research.ts` should be extracted to a shared utilities location for reuse across the codebase.

**Current location:** `app/actions/product-research.ts:31-38`

```typescript
function isURL(text: string): boolean {
  try {
    const url = new URL(text)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
```

**Proposed location:** `lib/utils.ts` or `lib/helpers/url.ts`

This is a generic utility that could be useful in other parts of the app (form validation, input parsing, etc.).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Function moved to shared utility file
- [ ] #2 Original location imports from shared utility
- [ ] #3 Function is exported and typed
- [ ] #4 Any other potential usages identified and updated
<!-- AC:END -->
