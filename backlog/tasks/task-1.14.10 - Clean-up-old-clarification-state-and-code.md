---
id: task-1.14.10
title: Clean up old clarification state and code
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:28'
labels:
  - cleanup
  - refactor
dependencies: []
parent_task_id: task-1.14
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remove old clarification-related code that's been replaced by the new implementation.

**Remove:**
- `clarificationQuestions: string[]` state (replaced by `pendingResult.questions`)
- `clarificationAnswers: string` state (replaced by `structuredAnswers`)
- Old textarea-based clarification UI
- Any compatibility shims

**Verify:**
- No unused imports
- No dead code paths
- All state properly initialized/reset
- Dialog reset works correctly

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Old string-based state removed
- [ ] #2 Old textarea UI removed
- [ ] #3 No unused imports
- [ ] #4 Dialog reset works correctly
- [ ] #5 No TypeScript errors
<!-- AC:END -->
