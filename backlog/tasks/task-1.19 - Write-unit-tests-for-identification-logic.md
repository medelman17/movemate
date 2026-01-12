---
id: task-1.19
title: Write unit tests for identification logic
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - testing
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create comprehensive tests for the new identification flow:

**Test cases:**
1. High-confidence identification (brand visible) → Direct result
2. Store search strategy → Correct questions generated
3. Feature match strategy → Features included in search
4. Use estimates fallback → No questions, estimates returned
5. User provides retailer → Search query includes retailer
6. User finds label → Direct product lookup
7. API timeout → Graceful fallback to estimates
8. Generic item detection → Triggers use_estimates strategy
9. Confidence computation → Correct scores from signals
10. Category defaults → Correct values returned

**Mocking:**
- Mock `generateObject` responses
- Mock Perplexity API responses
- Test each strategy in isolation
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tests for each identification strategy
- [ ] #2 Tests for confidence computation
- [ ] #3 Tests for error handling/fallbacks
- [ ] #4 Tests for answer processing
- [ ] #5 Mocks for external APIs
- [ ] #6 Tests pass in CI
<!-- AC:END -->
