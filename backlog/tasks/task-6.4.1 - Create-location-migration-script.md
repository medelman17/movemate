---
id: task-6.4.1
title: Create location migration script
status: Done
assignee: []
created_date: '2026-01-13 15:30'
updated_date: '2026-01-13 16:03'
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
- [x] #1 Script in scripts/ folder
- [x] #2 Dry-run mode shows what would change
- [x] #3 Icon matching for common room names
- [x] #4 Updates items with location_id
- [x] #5 Reports success/failure counts
<!-- AC:END -->
