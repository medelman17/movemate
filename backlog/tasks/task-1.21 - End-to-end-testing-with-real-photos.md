---
id: task-1.21
title: End-to-end testing with real photos
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - testing
  - qa
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the complete flow with real furniture photos:

**Test scenarios:**
1. IKEA furniture (common, should be identifiable)
2. Generic furniture (should use estimates)
3. Electronics with visible brand
4. Unclear/blurry photo
5. Multiple items in frame
6. Partial item visibility

**For each test:**
- Upload photo
- Note questions asked (if any)
- Provide realistic answers
- Verify final identification accuracy
- Measure total time

Document results and edge cases discovered.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tested with 10+ real photos
- [ ] #2 Various furniture types covered
- [ ] #3 Edge cases documented
- [ ] #4 Performance meets <4s target for initial analysis
- [ ] #5 Accuracy acceptable for moving manifest use case
<!-- AC:END -->
