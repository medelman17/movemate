---
id: task-4.21
title: Update identify-from-photo.ts to use extracted prompts
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - integration
  - photo-identification
dependencies:
  - task-4.12
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor `app/actions/identify-from-photo.ts` to import prompts from `lib/prompts/photo-identification`:

**Changes required:**
1. Remove inline prompt strings (lines 137-197)
2. Import prompt builders and configs
3. Update `attemptIdentification()` to use imported prompts
4. Keep all other logic unchanged

**Before:**
```typescript
if (strategy === "detailed") {
  promptText = `Analyze this image...`; // 25 lines
}
```

**After:**
```typescript
import { getPhotoPrompt } from "@/lib/prompts/photo-identification";

const { build, config } = getPhotoPrompt(strategy);
const promptText = build({ userContext });
```

**Critical:** Behavior must remain identical. Run manual tests after changes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All inline prompts removed from file
- [ ] #2 Imports from lib/prompts/photo-identification
- [ ] #3 attemptIdentification uses prompt builders
- [ ] #4 All existing tests pass
- [ ] #5 Manual test: photo identification still works
<!-- AC:END -->
