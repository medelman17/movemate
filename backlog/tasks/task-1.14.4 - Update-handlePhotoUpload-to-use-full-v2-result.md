---
id: task-1.14.4
title: Update handlePhotoUpload to use full v2 result
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:26'
labels:
  - ui
  - logic
dependencies: []
parent_task_id: task-1.14
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the photo upload handler to call the full v2 API and store the complete result.

**Changes:**
1. Call `identifyProductFromPhotoV2(processedImage)` 
2. Store full result in `setPendingResult(result)`
3. If `result.identified` with high confidence → proceed to research
4. If `result.questions` exists → show clarification UI
5. If neither → use estimates directly

**Handle the StrategicIdentificationResult:**
```typescript
const result = await identifyProductFromPhotoV2(processedImage);

if (result.identified && result.identified.confidence === 'high') {
  // Direct identification - proceed to research
} else if (result.questions && result.questions.length > 0) {
  // Need clarification - store result and show questions
  setPendingResult(result);
  setClarificationNeeded(true);
  setClarificationRound(1);
} else {
  // Use estimates directly
  applyEstimates(result.estimates);
}
```

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Full v2 API called on photo upload
- [ ] #2 Result stored in pendingResult state
- [ ] #3 High confidence results proceed to research
- [ ] #4 Questions trigger clarification UI
- [ ] #5 No-question results use estimates
<!-- AC:END -->
