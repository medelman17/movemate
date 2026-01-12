---
id: task-1.8
title: Implement feature_match strategy
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - feature
  - ai
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When item has distinctive design features, search by those features:

**How it works:**
1. AI identifies distinctive features from photo (e.g., "button tufted", "hairpin legs", "waterfall edge", "channel stitching")
2. Combine features with item type for search
3. Search: "mid-century sofa button tufted walnut legs gray"

**Optional refinement questions:**
- "What material is this made of?" (if unclear from photo)
- "Is this a specific style you were going for?" (modern, traditional, industrial)

**When to use:**
- Distinctive enough design that features narrow it down
- User doesn't know retailer/purchase info
- No label accessible

This is the fallback before pure visual estimates.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Distinctive features extracted from photo analysis
- [ ] #2 Features combined into searchable query
- [ ] #3 Optional refinement questions when helpful
- [ ] #4 Handles items with vs without distinctive features
<!-- AC:END -->
