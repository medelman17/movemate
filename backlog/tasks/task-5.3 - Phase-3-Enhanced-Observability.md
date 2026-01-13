---
id: task-5.3
title: 'Phase 3: Enhanced Observability'
status: Done
assignee: []
created_date: '2026-01-13 14:19'
updated_date: '2026-01-13 14:41'
labels:
  - ai
  - observability
  - analytics
dependencies:
  - task-5.2
parent_task_id: task-5
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rich analytics and business metrics - track strategy effectiveness, clarification outcomes, and custom scores.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Track strategy effectiveness (which photo ID strategies succeed)
- [x] #2 Log clarification question → answer → outcome correlation
- [x] #3 Add custom scores for result quality (identification_success)
- [ ] #4 Set up Langfuse alerts for error rates and latency
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan\n\n### Approach\nServer-side scoring: capture traceId during AI call, store it with the result, score when user submits form.\n\n### Key Dependencies\n- `@langfuse/client` - for scoring API\n- `@langfuse/tracing` - for getActiveTraceId()\n\n### Data Flow\n1. AI call → capture traceId → include in result\n2. UI stores traceId with pending identification\n3. Form submit → server action compares AI name vs submitted name\n4. Score sent to Langfuse (1=accepted, 0=corrected)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Phase 3 complete:
- Installed @langfuse/client and @langfuse/tracing packages
- Added traceId to StrategicIdentificationResult type
- Capture traceId via getActiveTraceId() after AI call
- Created lib/langfuse/scoring.ts with logIdentificationOutcome()
- Updated add-item-dialog.tsx to track AI suggestion and score on submit
- Scores logged: identification_accepted (boolean), name_changed, category_changed, dimensions_changed
- Fire-and-forget pattern ensures scoring never blocks user flow
- Note: Alerts (#4) are Langfuse dashboard configuration, not code
<!-- SECTION:NOTES:END -->
