---
id: task-1.14.5
title: Update clarification UI to render rich questions
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:28'
labels:
  - ui
dependencies: []
parent_task_id: task-1.14
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the current bullet-list + textarea UI with rich question inputs.

**Current UI:**
- Bullet list of question strings
- Single textarea for all answers
- Add photo button

**New UI:**
- Each question rendered with ClarificationQuestionInput
- Strategy indicator (what approach is being used)
- Rationale shown as helper text under each question
- Structured answer collection

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ 🔍 Help us identify this product                │
│ Strategy: {strategy.approach} - {strategy.reasoning} │
├─────────────────────────────────────────────────┤
│ Q1: {question.question}                         │
│ [ Input based on inputType ]                    │
│ ↳ {question.rationale}                          │
│                                                 │
│ Q2: {question.question}                         │
│ [ Input based on inputType ]                    │
│ ↳ {question.rationale}                          │
└─────────────────────────────────────────────────┘
```

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Questions rendered individually with proper input types
- [ ] #2 Rationale shown as helper text
- [ ] #3 Strategy info displayed
- [ ] #4 Answers collected in structuredAnswers state
<!-- AC:END -->
