---
id: task-8
title: Add Observability Stack (Sentry + Pino)
status: To Do
assignee: []
created_date: '2026-01-13 16:53'
labels:
  - observability
  - infrastructure
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement comprehensive observability for MoveMate:

**Current State:**
- Langfuse for LLM tracing (keep)
- console.log for application logs (replace)
- No error monitoring (add)

**Target State:**
- Sentry for errors, crashes, session replay, performance
- Pino for structured JSON logging
- Langfuse for LLM-specific observability (unchanged)

**Why Both:**
- Sentry: Application errors, user session replay, crash reporting
- Langfuse: LLM traces, prompt versioning, token costs, scoring
- Pino: Fast structured logs for debugging and audit trails

**Cost:** Sentry free tier (5K errors/mo) + Pino (free)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Sentry captures client and server errors with source maps
- [ ] #2 Session Replay enabled for error sessions
- [ ] #3 Pino replaces console.log with structured JSON
- [ ] #4 Sentry and Langfuse coexist via OpenTelemetry
- [ ] #5 No performance regression from instrumentation
<!-- AC:END -->
