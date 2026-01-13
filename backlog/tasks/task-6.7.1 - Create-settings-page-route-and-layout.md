---
id: task-6.7.1
title: Create settings page route and layout
status: Done
assignee: []
created_date: '2026-01-13 15:30'
updated_date: '2026-01-13 15:32'
labels:
  - ui
  - page
dependencies: []
parent_task_id: task-6.7
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `/settings/locations` page with basic layout, header, and Add New button. Wire up navigation from main page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Route /settings/locations exists
- [x] #2 Header with back navigation
- [x] #3 Add New button wired to open modal
- [x] #4 Basic responsive layout
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed: Created /settings/locations page

- Route at app/settings/locations/page.tsx

- Header with back navigation to home

- Add New button (modal placeholder)

- Location list with icon, name, item count

- Edit/Delete buttons per location

- Drag handle placeholder for reordering

- Empty state handling

- Settings icon added to main page header

- Build passes
<!-- SECTION:NOTES:END -->
