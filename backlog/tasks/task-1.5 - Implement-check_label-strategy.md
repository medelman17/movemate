---
id: task-1.5
title: Implement check_label strategy
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - feature
  - ux
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When the AI determines `check_label` is the best strategy, generate questions that guide the user to find product labels:

**Question templates:**
- "Can you check for a tag under the seat cushions?"
- "There's often a label on the back bottom corner - can you look?"
- "Check inside any drawers for a manufacturer sticker"
- "Look underneath for a barcode or model number label"

**Item-specific guidance:**
- Sofas/chairs: under cushions, back bottom frame, underneath
- Tables: underneath the tabletop, on leg brackets
- Dressers/cabinets: inside drawers, back panel
- Electronics: back panel, bottom, near power cord
- Mattresses: side label or law tag

If user finds label info, use it for direct product lookup.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Category-specific label location hints
- [ ] #2 Clear instructions for where to look
- [ ] #3 Handles case when user finds vs doesn't find label
- [ ] #4 Label info used for direct product search when found
<!-- AC:END -->
