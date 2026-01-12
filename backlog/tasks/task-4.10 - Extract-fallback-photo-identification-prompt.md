---
id: task-4.10
title: Extract fallback photo identification prompt
status: To Do
assignee: []
created_date: '2026-01-12 18:24'
labels:
  - prompts
  - photo-identification
  - extraction
dependencies:
  - task-4.2
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/photo-identification/fallback.ts` by extracting the "fallback" strategy prompt from `app/actions/identify-from-photo.ts:183-196`.

**Source prompt location:** Lines 183-196 in identify-from-photo.ts

**Key characteristics:**
- Simplest prompt - basic category identification
- Always low confidence
- May set needsManualReview: true
- No clarification questions

**File structure mirrors detailed.ts with fallback-specific content.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompt extracted to dedicated file
- [ ] #2 Zod output schema defined
- [ ] #3 PromptConfig metadata included
- [ ] #4 buildPrompt function accepts context
- [ ] #5 Confidence always low
<!-- AC:END -->
