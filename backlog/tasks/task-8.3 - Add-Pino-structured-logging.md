---
id: task-8.3
title: Add Pino structured logging
status: Done
assignee: []
created_date: '2026-01-13 16:53'
updated_date: '2026-01-13 17:06'
labels:
  - observability
dependencies: []
parent_task_id: task-8
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace console.log with Pino for structured JSON logging:

```bash
pnpm add pino
```

**Create lib/logger.ts:**
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});
```

**Benefits:**
- 5-10x faster than console.log
- JSON output for machine parsing
- Log levels (debug, info, warn, error)
- Structured context objects
<!-- SECTION:DESCRIPTION:END -->
