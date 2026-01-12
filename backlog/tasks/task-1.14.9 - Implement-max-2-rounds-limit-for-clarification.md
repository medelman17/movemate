---
id: task-1.14.9
title: Implement max 2 rounds limit for clarification
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:28'
labels:
  - logic
  - ux
dependencies: []
parent_task_id: task-1.14
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enforce a maximum of 2 clarification rounds to prevent infinite loops.

**Logic:**
1. Track `clarificationRound` (starts at 0)
2. After each clarification submit, increment round
3. If `clarificationRound >= 2` and still no identification:
   - Don't show more questions
   - Auto-apply estimates
   - Show message: "We couldn't identify the exact product. Using visual estimates."

**Edge cases:**
- If user skips questions, don't count as a round
- If identification succeeds on round 2, proceed normally
- Reset round counter when new photo uploaded

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Round counter tracks clarification attempts
- [ ] #2 Max 2 rounds enforced
- [ ] #3 Estimates auto-applied after max rounds
- [ ] #4 Round counter resets on new photo
- [ ] #5 Clear messaging when max reached
<!-- AC:END -->
