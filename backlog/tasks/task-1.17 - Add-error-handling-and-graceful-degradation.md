---
id: task-1.17
title: Add error handling and graceful degradation
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - error-handling
  - reliability
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ensure robust error handling throughout the new flow:

**Scenarios to handle:**
1. GPT-4o API timeout → Use category defaults
2. Schema validation fails → Fall back to text parsing (legacy behavior)
3. Perplexity API fails → Use visual estimates
4. Invalid image URL → Clear error message
5. User provides nonsense answers → Ignore and use estimates

**Graceful degradation chain:**
```
Exact identification (Perplexity success)
    ↓ fails
Feature-based search results
    ↓ fails
Visual estimates from photo
    ↓ fails
Category-based defaults
    ↓ fails
Manual entry prompt
```

Never leave user stuck - always provide a path forward.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All API failures have fallback behavior
- [ ] #2 User never sees raw error messages
- [ ] #3 Degradation chain documented in code
- [ ] #4 Timeouts configured appropriately
- [ ] #5 Logging captures failures for debugging
<!-- AC:END -->
