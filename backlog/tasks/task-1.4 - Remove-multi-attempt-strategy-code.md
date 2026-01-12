---
id: task-1.4
title: Remove multi-attempt strategy code
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - refactor
  - cleanup
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Delete the sequential 3-attempt approach:

1. Remove `attemptIdentification` function entirely
2. Remove strategy parameter ("detailed" | "visual" | "fallback")
3. Remove the sequential fallback logic in `identifyProductFromPhoto`
4. Remove `isGenericResponse` helper (will be replaced by computed confidence)
5. Clean up unused imports and types

Keep the core function signature compatible for now to avoid breaking callers.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 attemptIdentification function removed
- [ ] #2 No sequential API calls in identification flow
- [ ] #3 isGenericResponse helper removed
- [ ] #4 File has no dead code
- [ ] #5 Main function signature preserved for compatibility
<!-- AC:END -->
