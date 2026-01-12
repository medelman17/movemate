---
id: task-1.14.2
title: Add state variables for rich clarification flow
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:25'
labels:
  - ui
  - state
dependencies: []
parent_task_id: task-1.14
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add new state variables to support the multi-round clarification flow with structured data.

**New state variables:**
```typescript
// Store full v2 result for multi-round flow
const [pendingResult, setPendingResult] = useState<StrategicIdentificationResult | null>(null);

// Track structured answers by question text  
const [structuredAnswers, setStructuredAnswers] = useState<Record<string, string>>({});

// Track clarification round (max 2)
const [clarificationRound, setClarificationRound] = useState(0);
```

**Remove/replace:**
- `clarificationQuestions: string[]` → use `pendingResult.questions`
- `clarificationAnswers: string` → use `structuredAnswers`

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 pendingResult state added
- [ ] #2 structuredAnswers state added
- [ ] #3 clarificationRound state added
- [ ] #4 Old string-based state removed
<!-- AC:END -->
