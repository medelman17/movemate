---
id: task-4.7
title: Create shared fragments index with re-exports
status: Done
assignee: []
created_date: '2026-01-12 18:23'
updated_date: '2026-01-12 18:31'
labels:
  - prompts
  - shared
dependencies:
  - task-4.3
  - task-4.4
  - task-4.5
  - task-4.6
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/shared/index.ts` that re-exports all shared fragments:

```typescript
// Output formatting
export { 
  jsonOutputInstruction, 
  jsonOnlyReminder, 
  wrapJsonResponse 
} from "./output-format";

// Confidence levels
export { 
  confidenceLevels, 
  confidenceLevelsCompact,
  confidenceThresholds,
  type ConfidenceLevel 
} from "./confidence-levels";

// Dimension conversion  
export { 
  dimensionConversionRules, 
  dimensionFormat 
} from "./dimension-conversion";

// Moving context
export { 
  movingInventoryContext,
  itemCategories,
  categoryExamples,
  type ItemCategory
} from "./moving-context";
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All shared fragments re-exported
- [ ] #2 No circular dependencies
- [ ] #3 TypeScript compilation passes
<!-- AC:END -->
