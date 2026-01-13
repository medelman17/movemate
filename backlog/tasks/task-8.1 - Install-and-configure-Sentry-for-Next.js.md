---
id: task-8.1
title: Install and configure Sentry for Next.js
status: Done
assignee: []
created_date: '2026-01-13 16:53'
updated_date: '2026-01-13 17:14'
labels:
  - observability
dependencies: []
parent_task_id: task-8
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run Sentry wizard and configure for Next.js 16:

```bash
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
- Create Sentry project (free tier)
- Configure DSN in environment variables
- Set sample rates (20% traces, 10% replays, 100% on error)
- Enable source map uploads
- Configure for client, server, and edge runtimes

**Files created:**
- sentry.client.config.ts
- sentry.server.config.ts  
- sentry.edge.config.ts
- Updated next.config.ts
<!-- SECTION:DESCRIPTION:END -->
