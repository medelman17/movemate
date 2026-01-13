---
id: task-5.2
title: 'Phase 2: Full Telemetry Coverage'
status: To Do
assignee: []
created_date: '2026-01-13 14:19'
labels:
  - ai
  - observability
dependencies:
  - task-5.1
parent_task_id: task-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Instrument all AI calls with proper metadata, create telemetry helpers, and add trace correlation for cascading calls.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Create lib/langfuse/telemetry.ts with helper functions
- [ ] #2 Add experimental_telemetry to all generateObject/generateText calls
- [ ] #3 Map PromptConfig metadata to Langfuse attributes
- [ ] #4 Create lib/langfuse/trace-context.ts for trace correlation
- [ ] #5 Add user/session context to traces
- [ ] #6 Instrument product-research.ts and simplify-product-name.ts
<!-- AC:END -->
