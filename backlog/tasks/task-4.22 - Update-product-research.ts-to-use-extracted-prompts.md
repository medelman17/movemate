---
id: task-4.22
title: Update product-research.ts to use extracted prompts
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - integration
  - product-research
dependencies:
  - task-4.16
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor `app/actions/product-research.ts` to import prompts from `lib/prompts/product-research`:

**Changes required:**
1. Remove inline prompt strings (lines 46-133)
2. Remove local `productInfoSchema` (moved to lib/prompts)
3. Import prompt builders, configs, and schema
4. Update `researchProduct()` to use imported prompts

**Before:**
```typescript
const prompt = isProductURL
  ? `Fetch and analyze...` // 43 lines
  : `Search the web...`;   // 44 lines
```

**After:**
```typescript
import { buildResearchPrompt, productInfoSchema } from "@/lib/prompts/product-research";

const prompt = buildResearchPrompt(input, isProductURL);
```

**Critical:** Behavior must remain identical.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All inline prompts removed from file
- [ ] #2 productInfoSchema imported from lib/prompts
- [ ] #3 Imports from lib/prompts/product-research
- [ ] #4 researchProduct uses prompt builders
- [ ] #5 Manual test: product research still works
<!-- AC:END -->
