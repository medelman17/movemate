---
id: task-1.14.3
title: Create ClarificationQuestionInput component
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:26'
labels:
  - ui
  - component
dependencies: []
parent_task_id: task-1.14
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a component that renders a clarification question with the appropriate input type based on `inputType`.

**Input types to support:**
- `select`: Dropdown using existing Select component with options array
- `text`: Input with placeholder from question
- `photo`: File upload button (reuse existing photo upload logic)
- `number`: Number input
- `date`: Date input (optional, can defer)

**Props:**
```typescript
interface ClarificationQuestionInputProps {
  question: ClarificationQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}
```

**Location:** Can be inline in `add-item-dialog.tsx` or extract to `components/inventory/clarification-question-input.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Select input renders dropdown with options
- [ ] #2 Text input renders with placeholder
- [ ] #3 Photo input triggers file upload
- [ ] #4 Number input accepts numeric values
- [ ] #5 Component is reusable for each question
<!-- AC:END -->
