---
id: task-1.14.8
title: Add Skip & Use Estimates button
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:28'
labels:
  - ui
  - ux
dependencies: []
parent_task_id: task-1.14
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a button that allows users to skip clarification questions and use the visual estimates directly.

**Behavior:**
1. User clicks "Skip & Use Estimates"
2. Populate form with `pendingResult.estimates`:
   - name: `estimates.itemType`
   - category: `estimates.category`
   - dimensions: `estimates.dimensions`
   - weight: `estimates.weight`
   - can_disassemble: `estimates.canDisassemble`
3. Clear clarification state
4. Show toast: "Using visual estimates. You can refine details below."

**UI placement:**
- Secondary button next to "Submit Answers"
- Or as a link below the questions

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Skip button visible during clarification
- [ ] #2 Clicking populates form with estimates
- [ ] #3 Clarification state cleared
- [ ] #4 Toast notification shown
- [ ] #5 User can edit pre-filled values
<!-- AC:END -->
