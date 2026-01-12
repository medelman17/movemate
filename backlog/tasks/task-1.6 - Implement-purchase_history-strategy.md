---
id: task-1.6
title: Implement purchase_history strategy
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - feature
  - ux
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When `purchase_history` is the best strategy, help user locate purchase records:

**Questions:**
- "Do you have the order confirmation email for this item?"
- "Can you check your purchase history on [likely retailer]?"
- "Do you remember roughly when you bought this?"

**Follow-up handling:**
- If user pastes order info: Extract product name/SKU
- If user provides retailer + timeframe: Narrow search parameters
- If user can't find records: Fall back to feature_match or use_estimates

This strategy is high-value because order confirmations contain exact product names.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Questions guide user to find purchase records
- [ ] #2 Can extract product info from pasted order details
- [ ] #3 Graceful fallback when records unavailable
- [ ] #4 Handles various order confirmation formats
<!-- AC:END -->
