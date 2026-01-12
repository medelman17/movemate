---
id: task-4.9
title: Extract visual photo identification prompt
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:33'
labels:
  - prompts
  - photo-identification
  - extraction
dependencies:
  - task-4.2
  - task-4.4
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/photo-identification/visual.ts` by extracting the "visual" strategy prompt from `app/actions/identify-from-photo.ts:163-182`.

**Source prompt location:** Lines 163-182 in identify-from-photo.ts

**Key differences from detailed:**
- Ignores unclear text/labels
- Focuses on shape, size, material, color, style
- Handles edge cases (blurry, multiple objects, partial visibility)
- Default confidence is medium/low (never high)

**File structure mirrors detailed.ts with visual-specific content.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompt extracted to dedicated file
- [ ] #2 Zod output schema defined
- [ ] #3 PromptConfig metadata included
- [ ] #4 buildPrompt function accepts context
- [ ] #5 Confidence capped at medium
<!-- AC:END -->
