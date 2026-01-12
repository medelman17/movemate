---
id: task-4.18
title: Create utilities index with exports
status: To Do
assignee: []
created_date: '2026-01-12 18:24'
labels:
  - prompts
  - utilities
dependencies:
  - task-4.17
parent_task_id: task-4
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/utilities/index.ts` that exports all utility prompts:

```typescript
export { 
  systemPrompt as simplifyNameSystemPrompt, 
  PROMPT_META as SIMPLIFY_NAME_META 
} from "./simplify-name";
```

Keep this simple - utilities may grow over time.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Simplify name prompt exported
- [ ] #2 TypeScript compilation passes
<!-- AC:END -->
