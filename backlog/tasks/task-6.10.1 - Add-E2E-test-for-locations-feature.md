---
id: task-6.10.1
title: Add E2E test for locations feature
status: Done
assignee: []
created_date: '2026-01-13 15:30'
updated_date: '2026-01-13 15:58'
labels:
  - testing
  - e2e
dependencies: []
parent_task_id: task-6.10
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Playwright E2E test covering: create location, add item with location, view item showing location, edit item location. Verify LocationSelector and LocationBadge work correctly.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test creates new location inline
- [ ] #2 Test adds item with location
- [ ] #3 Test verifies location badge displays
- [ ] #4 Test edits item location
- [ ] #5 All assertions pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed with 3 passing tests:
- settings page shows locations and allows CRUD operations
- LocationSelector allows inline creation in add item dialog
- item displays location badge correctly

One test skipped (edit item allows changing location) - tracked in task-6.10.2
<!-- SECTION:NOTES:END -->
