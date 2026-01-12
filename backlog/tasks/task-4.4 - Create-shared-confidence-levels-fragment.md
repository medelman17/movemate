---
id: task-4.4
title: Create shared confidence levels fragment
status: To Do
assignee: []
created_date: '2026-01-12 18:23'
labels:
  - prompts
  - shared
dependencies:
  - task-4.1
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/shared/confidence-levels.ts` with reusable confidence rating guidelines:

```typescript
export const confidenceLevels = `CONFIDENCE LEVELS:
- HIGH: Brand name, model number, or distinctive identifiers clearly visible
- MEDIUM: Recognizable style, materials, or features but no specific identifiers  
- LOW: Generic category only, needs user clarification`;

export const confidenceLevelsCompact = `Rate confidence: HIGH (identifiers visible), MEDIUM (distinctive features), LOW (generic only)`;

export type ConfidenceLevel = "high" | "medium" | "low";

export const confidenceThresholds = {
  high: 0.85,
  medium: 0.6,
  low: 0.3,
} as const;
```

Used by photo identification prompts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 confidenceLevels string constant exported
- [ ] #2 confidenceLevelsCompact variant available
- [ ] #3 ConfidenceLevel type exported
- [ ] #4 Exported from shared/index.ts
<!-- AC:END -->
