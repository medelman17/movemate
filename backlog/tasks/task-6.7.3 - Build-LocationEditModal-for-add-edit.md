---
id: task-6.7.3
title: Build LocationEditModal for add/edit
status: Done
assignee: []
created_date: '2026-01-13 15:30'
updated_date: '2026-01-13 15:34'
labels:
  - ui
  - component
dependencies: []
parent_task_id: task-6.7
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create modal dialog for adding new location or editing existing. Fields: name (required), icon (emoji picker or text input), color (optional). Handle validation and submission.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Name input with validation
- [x] #2 Icon selection (emoji input)
- [x] #3 Create mode for new locations
- [x] #4 Edit mode with pre-filled values
- [x] #5 Save/Cancel buttons
- [x] #6 Error handling for duplicates
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed: Created LocationEditModal component

- Name input with 50 char validation

- Emoji icon picker with presets + custom input

- Create mode for new locations

- Edit mode with pre-filled values

- Save/Cancel buttons

- Error handling for duplicates

- Integrated into settings page

- Build passes
<!-- SECTION:NOTES:END -->
