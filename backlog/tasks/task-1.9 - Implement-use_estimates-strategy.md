---
id: task-1.9
title: Implement use_estimates strategy
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - feature
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Final fallback when exact identification isn't possible:

**When triggered:**
- Item is too generic (plain white bookshelf, basic folding chair)
- User can't provide any identifying information
- All other strategies exhausted

**Behavior:**
- Skip clarification questions entirely
- Use visual estimates directly
- Return item type + estimates without Perplexity search

**Visual estimation sources:**
1. Item type norms (average couch is 84" wide, bookshelf is 72" tall)
2. Proportions visible in image
3. Context clues (doorframes ~80", outlets ~12" from floor)
4. Relative sizing if multiple objects visible

**Output:**
Generic name + category + visual estimates. Good enough for moving manifest.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 No questions asked for generic items
- [ ] #2 Visual estimates used directly
- [ ] #3 Perplexity search skipped
- [ ] #4 Returns usable data for moving manifest
- [ ] #5 Category-based defaults for unknown dimensions
<!-- AC:END -->
