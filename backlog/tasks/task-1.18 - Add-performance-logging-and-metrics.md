---
id: task-1.18
title: Add performance logging and metrics
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - observability
  - performance
dependencies: []
parent_task_id: task-1
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Instrument the new flow to measure performance improvements:

**Metrics to capture:**
- `identification_duration_ms`: Total time from photo to result
- `api_calls_count`: Number of AI API calls made
- `strategy_used`: Which identification strategy succeeded
- `clarification_rounds`: How many Q&A rounds needed
- `final_confidence`: Computed confidence of result
- `fallback_used`: Whether visual estimates were used

**Logging:**
```typescript
console.log("[identify] Started", { imageUrl, hasContext: !!userContext })
console.log("[identify] Analysis complete", { 
  duration: Date.now() - start,
  strategy: result.strategy.approach,
  confidence: computedConfidence
})
console.log("[identify] Complete", {
  totalDuration,
  apiCalls,
  result: result.fullProductName
})
```

Structure logs for easy parsing/aggregation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Duration tracked for each phase
- [ ] #2 API call count logged
- [ ] #3 Strategy and confidence captured
- [ ] #4 Logs are structured (JSON-parseable)
- [ ] #5 Can compare before/after performance
<!-- AC:END -->
