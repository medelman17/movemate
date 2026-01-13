---
id: task-8.2
title: Configure Sentry Session Replay
status: Done
assignee: []
created_date: '2026-01-13 16:53'
updated_date: '2026-01-13 17:15'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Session Replay configured in instrumentation-client.ts with replayIntegration: 10% session sample rate in production, 100% on error, privacy masking enabled
<!-- SECTION:NOTES:END -->
