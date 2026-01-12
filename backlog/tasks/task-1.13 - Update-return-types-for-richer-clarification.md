---
id: task-1.13
title: Update return types for richer clarification
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - types
  - api
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enhance the clarification response to include input types and options:

**Current:**
```typescript
{ needsClarification: true; questions: string[] }
```

**New:**
```typescript
interface ClarificationRequest {
  needsClarification: true
  strategy: "check_label" | "purchase_history" | "store_search" | "feature_match"
  questions: Array<{
    id: string
    question: string
    rationale: string  // Why we're asking (shown as helper text)
    inputType: "text" | "select" | "photo" | "multiselect"
    options?: Array<{ value: string; label: string }>
    placeholder?: string
  }>
  partialResult: {
    itemType: string
    category: string
    visualEstimates: VisualEstimates
  }
}
```

Include partial results so UI can show what we know while asking questions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Clarification includes input type and options
- [ ] #2 Rationale included for each question
- [ ] #3 Partial results available during clarification
- [ ] #4 Strategy type exposed for UI customization
- [ ] #5 Types exported for use in components
<!-- AC:END -->
