---
id: task-1.2
title: Design single-pass prompt for photo analysis
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - ai
  - prompt-engineering
dependencies: []
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Craft one comprehensive prompt that replaces the 3-attempt strategy. The prompt must:

1. **Extract item identification** - Type, category, style family
2. **Identify distinctive features** - Design elements that could help search (tufted, hairpin legs, channel stitching, waterfall edge)
3. **Provide visual estimates** - Dimensions, weight, disassembly based on item type norms and visual cues
4. **Determine best identification strategy** - Which approach has highest chance of finding exact product
5. **Generate strategic questions** - 2-3 high-value questions based on chosen strategy

The prompt should:
- Use context clues for size estimation (doorframes, outlets, standard furniture)
- Acknowledge that brand labels are rarely visible
- Focus on features that are searchable
- Consider item category when choosing strategy (furniture vs electronics vs appliances)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Single prompt extracts all needed information
- [ ] #2 Prompt fits within reasonable token limit
- [ ] #3 Prompt produces consistent structured output
- [ ] #4 Includes examples for better AI guidance
- [ ] #5 Handles edge cases (multiple items, partial visibility, poor lighting)
<!-- AC:END -->
