---
id: task-1.1
title: Define Zod schemas for photo identification
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - ai
  - schema
dependencies: []
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create comprehensive Zod schemas for structured AI output:

1. **IdentificationResultSchema** - Main schema for photo analysis
   - `itemType`: string (e.g., "Sectional Sofa", "Bookshelf")
   - `category`: enum of furniture/electronics/appliances/etc.
   - `distinctiveFeatures`: array of design elements
   - `styleFamily`: string (mid-century, industrial, traditional)
   - `visualEstimates`: nested object for dimensions/weight/disassembly
   - `strategy`: identification approach with questions

2. **StrategyQuestionSchema** - Schema for follow-up questions
   - `question`: the question text
   - `rationale`: why this helps identify the item
   - `inputType`: "text" | "select" | "photo"
   - `options`: array for select inputs

3. **VisualEstimatesSchema** - Fallback measurements
   - `dimensions`: { length, width, height } in inches
   - `weightLbs`: estimated weight
   - `canDisassemble`: boolean
   - `fragile`: boolean
   - `requiresTwoPersonLift`: boolean

4. **CategoryEnum** - Standardized item categories for the app
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All schemas defined with proper Zod types
- [ ] #2 Schemas include .describe() annotations for AI guidance
- [ ] #3 Schemas are exported for use in other files
- [ ] #4 TypeScript types inferred from schemas (z.infer)
<!-- AC:END -->
