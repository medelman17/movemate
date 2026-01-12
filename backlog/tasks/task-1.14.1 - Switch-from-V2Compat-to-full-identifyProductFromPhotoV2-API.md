---
id: task-1.14.1
title: Switch from V2Compat to full identifyProductFromPhotoV2 API
status: Done
assignee: []
created_date: '2026-01-12 21:23'
updated_date: '2026-01-12 21:25'
labels:
  - ui
  - refactor
dependencies: []
parent_task_id: task-1.14
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update imports in `add-item-dialog.tsx` to use the full v2 API instead of the backward-compatible wrapper.

**Changes:**
1. Import `identifyProductFromPhotoV2` instead of `identifyProductFromPhotoV2Compat`
2. Import `StrategicIdentificationResult` type
3. Import `ClarificationQuestion` type from `lib/prompts/photo-identification`

**File:** `components/inventory/add-item-dialog.tsx`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Imports updated to full v2 API
- [ ] #2 Types imported for StrategicIdentificationResult and ClarificationQuestion
- [ ] #3 No TypeScript errors
<!-- AC:END -->
