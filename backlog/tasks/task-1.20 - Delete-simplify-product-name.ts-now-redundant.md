---
id: task-1.20
title: Delete simplify-product-name.ts (now redundant)
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - cleanup
  - performance
dependencies: []
parent_task_id: task-1
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The new schema returns both `itemType` (simple name) and `fullName` (detailed name) in a single call. The separate `simplify-product-name.ts` action becomes redundant.

**Tasks:**
1. Verify no other code depends on `simplifyProductName`
2. Update any callers to use `itemType` from identification result
3. Delete `app/actions/simplify-product-name.ts`
4. Remove any imports of this function

This eliminates one API call from the pipeline.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All usages of simplifyProductName identified
- [ ] #2 Callers updated to use itemType from main result
- [ ] #3 File deleted
- [ ] #4 No broken imports
- [ ] #5 One less API call in the flow
<!-- AC:END -->
