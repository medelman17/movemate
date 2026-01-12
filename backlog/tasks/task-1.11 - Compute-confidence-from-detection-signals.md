---
id: task-1.11
title: Compute confidence from detection signals
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - ai
  - logic
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace unreliable AI self-reported confidence with computed confidence:

**Detection signals (from AI analysis):**
- `brandVisible`: boolean - Is a brand logo/name visible?
- `modelVisible`: boolean - Is a model number visible?
- `labelReadable`: boolean - Is there a readable product label?
- `imageClarity`: "clear" | "partial" | "poor"
- `distinctiveFeaturesCount`: number - How many unique features identified?

**Confidence calculation:**
```typescript
function computeConfidence(detection: Detection): number {
  let score = 0
  
  if (detection.brandVisible) score += 30
  if (detection.modelVisible) score += 30
  if (detection.labelReadable) score += 25
  if (detection.imageClarity === "clear") score += 10
  if (detection.distinctiveFeaturesCount >= 3) score += 15
  else if (detection.distinctiveFeaturesCount >= 1) score += 5
  
  return Math.min(score, 100)
}
```

Use computed confidence to determine if clarification is needed.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Confidence computed from objective signals
- [ ] #2 No reliance on AI self-reported confidence
- [ ] #3 Clear thresholds for when to ask questions vs proceed
- [ ] #4 Confidence score available in response for UI use
<!-- AC:END -->
