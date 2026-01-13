---
id: task-5.1
title: 'Phase 1: Core Langfuse Infrastructure'
status: Done
assignee: []
created_date: '2026-01-13 14:19'
updated_date: '2026-01-13 14:23'
labels:
  - ai
  - observability
dependencies: []
parent_task_id: task-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up OpenTelemetry + Langfuse SDK, enable basic tracing. This is the foundation for all observability.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Install packages: @langfuse/tracing, @langfuse/otel, @opentelemetry/sdk-node, @opentelemetry/api
- [x] #2 Create lib/langfuse/instrumentation.ts with OpenTelemetry setup
- [x] #3 Create instrumentation.ts in project root (Next.js hook)
- [x] #4 Add LANGFUSE_* environment variables to .env.example
- [x] #5 Enable instrumentationHook in next.config.ts
- [x] #6 Enable telemetry in identify-from-photo-v2.ts as proof-of-concept
- [ ] #7 Verify traces appear in Langfuse dashboard
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Phase 1 complete:
- Installed @langfuse/otel, @opentelemetry/sdk-node, @opentelemetry/api, import-in-the-middle, require-in-the-middle
- Created lib/langfuse/instrumentation.ts with LangfuseSpanProcessor v4 API
- Created instrumentation.ts in project root for Next.js hook
- Created lib/langfuse/telemetry.ts with helper functions
- Created .env.example with all LANGFUSE_* variables
- Added experimental_telemetry to identify-from-photo-v2.ts
- Note: instrumentationHook is enabled by default in Next.js 16, no config needed
- Criteria #7 (dashboard verification) requires Langfuse API keys to test
<!-- SECTION:NOTES:END -->
