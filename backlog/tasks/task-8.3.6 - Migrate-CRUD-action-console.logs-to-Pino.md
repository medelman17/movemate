---
id: task-8.3.6
title: Migrate CRUD action console.logs to Pino
status: Done
assignee: []
created_date: '2026-01-13 17:00'
updated_date: '2026-01-13 17:06'
labels: []
dependencies: []
parent_task_id: task-8.3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace console.log/error calls in app/actions/categories.ts and app/actions/locations.ts with dbLogger
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 categories.ts uses dbLogger
- [ ] #2 locations.ts uses dbLogger
- [ ] #3 No console.log remaining in these files
<!-- AC:END -->
