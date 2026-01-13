---
id: task-5
title: Integrate Langfuse for LLM Observability
status: Done
assignee: []
created_date: '2026-01-13 14:19'
updated_date: '2026-01-13 14:43'
labels:
  - ai
  - observability
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add Langfuse integration for tracing, analytics, and observability of all AI calls. Uses OpenTelemetry via Vercel AI SDK's built-in telemetry and Langfuse's v4 SDK. See docs/LANGFUSE_INTEGRATION_PLAN.md for full details.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 OpenTelemetry + Langfuse SDK installed and configured
- [x] #2 All AI calls instrumented with telemetry
- [ ] #3 Traces visible in Langfuse dashboard
- [x] #4 Custom metadata (strategy, confidence, etc.) tracked
- [x] #5 User/session context included in traces
- [x] #6 Feature flag for enable/disable
- [ ] #7 Unit tests for telemetry helpers
- [x] #8 Build passes with no type errors
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completion Summary (2026-01-13)

Phases 1-3 complete:
- **Phase 1**: Core infrastructure (LangfuseSpanProcessor, instrumentation.ts, env vars)
- **Phase 2**: Full telemetry coverage (all 3 AI server actions instrumented)
- **Phase 3**: User outcome scoring (traceId capture, scoring on form submit)

Commits:
- bf406d9: feat: add Langfuse integration for LLM observability (Phase 1)
- 32fdce8: feat: add telemetry to all AI calls (Phase 2)
- 730426d: feat: add user outcome scoring for Langfuse (Phase 3)

Note: #3 (Traces visible) requires runtime verification. #7 (Unit tests) deferred to Phase 4.
<!-- SECTION:NOTES:END -->
