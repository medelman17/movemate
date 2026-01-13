---
id: task-8.4
title: Replace console.log calls with Pino logger
status: Done
assignee: []
created_date: '2026-01-13 16:53'
updated_date: '2026-01-13 17:07'
labels:
  - observability
dependencies:
  - task-8.3
parent_task_id: task-8
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Migrate existing console.log/warn/error to Pino:

**Files to update:**
- app/actions/identify-from-photo-v2.ts
- app/actions/product-research.ts
- lib/langfuse/instrumentation.ts
- scripts/*.ts

**Pattern:**
```typescript
// Before
console.log('[v2] Analysis complete', { duration, strategy });

// After
logger.info({ duration, strategy }, 'Photo analysis complete');
```

**Guidelines:**
- Use appropriate log levels
- Put structured data first, message second
- Include trace IDs where available
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed as part of task-8.3.5, task-8.3.6, and task-8.3.7
<!-- SECTION:NOTES:END -->
