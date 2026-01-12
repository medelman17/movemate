---
id: task-1.15
title: Identify and update UI components that consume identification
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - ui
  - refactor
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Find all components that call `identifyProductFromPhoto` and ensure they handle the new response format:

**Tasks:**
1. Search codebase for all usages of `identifyProductFromPhoto`
2. Identify components that handle clarification flow
3. Update to handle new `ClarificationRequest` type
4. Support new input types (select dropdowns, not just text)
5. Display partial results while asking questions
6. Show rationale as helper text under questions

**Expected changes:**
- Photo upload component
- Item add/edit modal
- Any clarification dialogs
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All consumers of identifyProductFromPhoto identified
- [ ] #2 UI handles new clarification format
- [ ] #3 Select inputs rendered for select questions
- [ ] #4 Partial results displayed during clarification
- [ ] #5 Rationale shown as helper text
<!-- AC:END -->
