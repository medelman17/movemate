---
id: task-6.4.1
title: Create location migration script
status: To Do
assignee: []
created_date: '2026-01-13 15:30'
labels:
  - database
  - script
dependencies: []
parent_task_id: task-6.4
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TypeScript script to migrate existing text-based locations to structured location records. Extract unique locations per user, create records with guessed icons, update items with location_id FK.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Script in scripts/ folder
- [ ] #2 Dry-run mode shows what would change
- [ ] #3 Icon matching for common room names
- [ ] #4 Updates items with location_id
- [ ] #5 Reports success/failure counts
<!-- AC:END -->
