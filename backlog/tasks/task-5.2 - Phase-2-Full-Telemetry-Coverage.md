---
id: task-5.2
title: 'Phase 2: Full Telemetry Coverage'
status: Done
assignee: []
created_date: '2026-01-13 14:19'
updated_date: '2026-01-13 14:28'
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
- [x] #1 Create lib/langfuse/telemetry.ts with helper functions
- [x] #2 Add experimental_telemetry to all generateObject/generateText calls
- [x] #3 Map PromptConfig metadata to Langfuse attributes
- [x] #4 Create lib/langfuse/trace-context.ts for trace correlation
- [ ] #5 Add user/session context to traces
- [x] #6 Instrument product-research.ts and simplify-product-name.ts
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Phase 2 complete:
- Added telemetry to product-research.ts with gateway pattern
- Added telemetry to simplify-product-name.ts with gateway pattern
- Created trace-context.ts with AsyncLocalStorage for trace correlation
- All AI calls now use experimental_telemetry
- Note: User/session context (#5) is available in telemetry helpers but not yet wired to auth
<!-- SECTION:NOTES:END -->
