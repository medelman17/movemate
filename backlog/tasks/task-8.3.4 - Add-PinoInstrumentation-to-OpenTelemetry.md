---
id: task-8.3.4
title: Add PinoInstrumentation to OpenTelemetry
status: Done
assignee: []
created_date: '2026-01-13 17:00'
updated_date: '2026-01-13 17:06'
labels: []
dependencies: []
parent_task_id: task-8.3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Integrate @opentelemetry/instrumentation-pino into existing OTel setup in lib/langfuse/instrumentation.ts for automatic trace_id/span_id injection
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 PinoInstrumentation added to NodeSDK instrumentations
- [ ] #2 Logs include trace_id and span_id when tracing is active
- [ ] #3 No conflicts with existing Langfuse instrumentation
<!-- AC:END -->
