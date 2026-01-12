---
id: task-1.14
title: Handle user answers and continue identification
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:28'
labels:
  - feature
  - logic
dependencies: []
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Parent task for implementing the rich clarification flow in the UI. This involves upgrading the add-item dialog to use the full v2 photo identification API with structured question types, answer collection, and partial results display.

**Current State:**
- Uses `identifyProductFromPhotoV2Compat` (backward-compatible wrapper)
- Shows questions as bullet list with single textarea
- No structured answer collection
- No partial results shown during clarification

**Target State:**
- Use `identifyProductFromPhotoV2` directly
- Render questions with proper input types (select, text, photo)
- Collect answers as `Record<string, string>` keyed by question text
- Show partial results (estimates) while asking questions
- Limit to 2 clarification rounds max
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Accepts answers keyed by question ID
- [ ] #2 Merges with original analysis
- [ ] #3 Routes to appropriate search based on strategy
- [ ] #4 Limits follow-up rounds (max 2 total)
- [ ] #5 Returns final result or falls back to estimates
<!-- AC:END -->
