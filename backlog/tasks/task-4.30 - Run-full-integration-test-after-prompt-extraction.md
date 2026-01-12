---
id: task-4.30
title: Run full integration test after prompt extraction
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - testing
  - integration
dependencies:
  - task-4.21
  - task-4.22
  - task-4.23
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After all prompts are extracted and server actions updated, perform comprehensive integration testing:

**Test checklist:**
1. **Photo identification flow:**
   - Upload a product photo
   - Verify identification works with high-confidence item
   - Verify clarification questions appear for ambiguous items
   - Verify fallback strategy triggers correctly

2. **Product research flow:**
   - Test with a product URL (e.g., IKEA product page)
   - Test with a product name search
   - Verify dimensions/weight are returned
   - Verify category assignment works

3. **Name simplification:**
   - Test with detailed product name
   - Verify simplified name is correct
   - Verify fallback works when AI fails

4. **Build verification:**
   - `pnpm build` completes without errors
   - `pnpm lint` passes
   - No TypeScript errors

**Document any issues found and create follow-up tasks if needed.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Photo identification tested end-to-end
- [ ] #2 Product research tested end-to-end
- [ ] #3 Name simplification tested
- [ ] #4 Build passes
- [ ] #5 Lint passes
- [ ] #6 No regressions found
<!-- AC:END -->
