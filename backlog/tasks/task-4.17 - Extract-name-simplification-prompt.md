---
id: task-4.17
title: Extract name simplification prompt
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:39'
labels:
  - prompts
  - utilities
  - extraction
dependencies:
  - task-4.2
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/utilities/simplify-name.ts` by extracting the system prompt from `app/actions/simplify-product-name.ts:25-48`.

**Source prompt location:** Lines 25-48 in simplify-product-name.ts

**Key characteristics:**
- System message (not user prompt)
- Contains 9 rules for simplification
- Includes 7 examples
- Uses gpt-4o-mini model
- maxTokens: 50

**File structure:**
```typescript
import type { PromptConfig } from "../types";

export const PROMPT_META: PromptConfig = {
  id: "simplify-product-name",
  version: "1.0.0",
  model: "openai/gpt-4o-mini",
  maxTokens: 50,
  description: "Simplifies detailed product names to generic item types",
  changelog: [{ version: "1.0.0", date: "2025-01-12", change: "Initial extraction" }],
};

export const systemPrompt = `You are a product name simplifier...`;

// No builder needed - this is a static system prompt
// User message is just the full product name
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 System prompt extracted to dedicated file
- [ ] #2 PromptConfig metadata included
- [ ] #3 All 9 rules preserved
- [ ] #4 All 7 examples preserved
- [ ] #5 gpt-4o-mini model configured
<!-- AC:END -->
