---
id: task-5.3.5
title: Hook scoring into form submission
status: Done
assignee: []
created_date: '2026-01-13 14:37'
updated_date: '2026-01-13 14:41'
labels:
  - ai
  - observability
  - ui
dependencies: []
parent_task_id: task-5.3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update add-item-dialog.tsx to call the scoring action when user submits the form, comparing AI suggestion to final value.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Store traceId from AI result in component state
- [ ] #2 On form submit, compare formData.name to original AI suggestion
- [ ] #3 Call logIdentificationOutcome with appropriate score
- [ ] #4 Fire-and-forget (don't block form submission)
<!-- AC:END -->
