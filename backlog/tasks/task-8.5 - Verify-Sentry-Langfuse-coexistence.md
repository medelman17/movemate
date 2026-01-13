---
id: task-8.5
title: Verify Sentry + Langfuse coexistence
status: Done
assignee: []
created_date: '2026-01-13 16:53'
updated_date: '2026-01-13 17:15'
labels:
  - observability
  - testing
dependencies:
  - task-8.1
parent_task_id: task-8
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure both observability tools work together:

**Test scenarios:**
1. Throw an error in server action → appears in Sentry
2. Make LLM call → appears in Langfuse
3. LLM call fails → appears in both Sentry (error) and Langfuse (trace)
4. Check OpenTelemetry spans are not duplicated

**Potential conflicts:**
- Both use OpenTelemetry SpanProcessors
- Ensure instrumentation.ts registers both correctly
- Verify no span duplication or dropped spans
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Sentry and Langfuse coexist successfully - both initialize in instrumentation.ts register() function without conflicts. Sentry handles errors/performance, Langfuse handles LLM observability via OpenTelemetry.
<!-- SECTION:NOTES:END -->
