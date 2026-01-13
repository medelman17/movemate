---
id: task-8.2
title: Configure Sentry Session Replay
status: To Do
assignee: []
created_date: '2026-01-13 16:53'
labels:
  - observability
dependencies:
  - task-8.1
parent_task_id: task-8
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enable Session Replay for debugging user issues:

```typescript
Sentry.init({
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% when errors occur
});
```

**Privacy considerations:**
- Mask sensitive inputs (passwords, credit cards)
- Review what gets captured
- Configure appropriate sampling
<!-- SECTION:DESCRIPTION:END -->
