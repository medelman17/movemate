---
id: task-4.23
title: Update simplify-product-name.ts to use extracted prompts
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - integration
  - utilities
dependencies:
  - task-4.18
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor `app/actions/simplify-product-name.ts` to import prompts from `lib/prompts/utilities`:

**Changes required:**
1. Remove inline system prompt (lines 25-48)
2. Import system prompt and config
3. Update `simplifyProductName()` to use imported prompt

**Before:**
```typescript
messages: [
  {
    role: "system",
    content: `You are a product name simplifier...`, // 24 lines
  },
```

**After:**
```typescript
import { simplifyNameSystemPrompt, SIMPLIFY_NAME_META } from "@/lib/prompts/utilities";

messages: [
  {
    role: "system",
    content: simplifyNameSystemPrompt,
  },
```

**Note:** Keep the `fallbackSimplify` function in the action file - it's business logic, not prompt content.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Inline system prompt removed
- [ ] #2 Imports from lib/prompts/utilities
- [ ] #3 fallbackSimplify remains in action file
- [ ] #4 Manual test: name simplification still works
<!-- AC:END -->
