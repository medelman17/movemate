---
id: task-1.14.7
title: Update handleClarificationSubmit with structured answers
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:28'
labels:
  - ui
  - logic
dependencies: []
parent_task_id: task-1.14
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the clarification submit handler to pass structured answers to the v2 API.

**Changes:**
1. Build `previousAnswers` from `structuredAnswers` state
2. Call `identifyProductFromPhotoV2(imageUrl, userContext, previousAnswers)`
3. Increment `clarificationRound`
4. Handle response same as initial call

**Code:**
```typescript
const handleClarificationSubmit = async () => {
  setIsAnalyzingPhoto(true);
  setClarificationNeeded(false);
  
  try {
    const result = await identifyProductFromPhotoV2(
      uploadedPhoto,
      undefined, // userContext
      structuredAnswers // previousAnswers keyed by question text
    );
    
    setClarificationRound(prev => prev + 1);
    
    if (result.identified && result.identified.confidence !== 'low') {
      // Got identification - proceed to research
      await proceedWithResearch(result.identified.fullProductName);
    } else if (result.questions?.length && clarificationRound < 2) {
      // More questions and under limit - ask again
      setPendingResult(result);
      setClarificationNeeded(true);
      setStructuredAnswers({}); // Reset for new questions
    } else {
      // Max rounds or no questions - use estimates
      applyEstimates(result.estimates);
    }
  } catch (error) {
    // Handle error
  }
};
```

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 structuredAnswers passed as previousAnswers
- [ ] #2 Round counter incremented
- [ ] #3 Successful identification proceeds to research
- [ ] #4 More questions shown if under round limit
- [ ] #5 Estimates used when rounds exhausted
<!-- AC:END -->
