---
id: task-1.14.6
title: Add estimates preview section during clarification
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:28'
labels:
  - ui
dependencies: []
parent_task_id: task-1.14
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Show the partial results (visual estimates) while asking clarification questions, so users know what fallback data is available.

**Section content:**
- Item type and category from `pendingResult.estimates`
- Estimated dimensions (length × width × height)
- Estimated weight
- Can disassemble flag
- Distinctive features from `pendingResult.features`
- Message: "These estimates will be used if identification cannot be completed"

**UI:**
```
┌─────────────────────────────────────────────────┐
│ 📦 Current Estimates                            │
│ Type: {estimates.itemType}                      │
│ Category: {estimates.category}                  │
│ Dimensions: ~{L}" × {W}" × {H}"                │
│ Weight: ~{weight} lbs                           │
│ Features: {features.join(", ")}                 │
│                                                 │
│ ℹ️ These will be used if we can't identify     │
└─────────────────────────────────────────────────┘
```

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Estimates preview shown during clarification
- [ ] #2 Shows item type, category, dimensions, weight
- [ ] #3 Shows distinctive features
- [ ] #4 Clear messaging about fallback behavior
<!-- AC:END -->
