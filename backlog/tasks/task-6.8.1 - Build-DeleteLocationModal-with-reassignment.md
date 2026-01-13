---
id: task-6.8.1
title: Build DeleteLocationModal with reassignment
status: Done
assignee: []
created_date: '2026-01-13 15:30'
updated_date: '2026-01-13 15:36'
labels:
  - ui
  - component
dependencies: []
parent_task_id: task-6.8
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create modal for deleting locations that may have items. Show item count, offer choice to reassign items to another location or leave unassigned. Use deleteLocation server action.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Shows item count for location
- [x] #2 Dropdown to select reassignment target
- [x] #3 Option to leave unassigned
- [x] #4 Cannot select self as target
- [x] #5 Delete button confirms action
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed: Created DeleteLocationModal component

- Shows item count for location being deleted

- Radio options: move to another location OR leave unassigned

- Dropdown to select reassignment target

- Cannot select self as target (filtered out)

- Integrated into settings page

- Added radio-group shadcn/ui component

- Build passes
<!-- SECTION:NOTES:END -->
