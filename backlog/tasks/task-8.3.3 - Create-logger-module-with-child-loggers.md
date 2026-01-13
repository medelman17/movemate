---
id: task-8.3.3
title: Create logger module with child loggers
status: Done
assignee: []
created_date: '2026-01-13 17:00'
updated_date: '2026-01-13 17:06'
labels: []
dependencies: []
parent_task_id: task-8.3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create lib/logger.ts with base Pino logger configured for prod (JSON) vs dev (pretty). Export child loggers for each domain: aiLogger, authLogger, dbLogger
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 lib/logger.ts exports base logger and child loggers
- [ ] #2 Pretty printing in development
- [ ] #3 JSON output in production
- [ ] #4 LOG_LEVEL env var support
<!-- AC:END -->
