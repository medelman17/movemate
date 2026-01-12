---
id: task-4.13
title: Extract URL-based product research prompt
status: To Do
assignee: []
created_date: '2026-01-12 18:24'
labels:
  - prompts
  - product-research
  - extraction
dependencies:
  - task-4.2
  - task-4.5
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/product-research/url-based.ts` by extracting the URL research prompt from `app/actions/product-research.ts:47-89`.

**Source prompt location:** Lines 47-89 in product-research.ts

**Key characteristics:**
- Takes a product URL as input
- Instructs to fetch and analyze the product page
- Extracts two names (simple + full)
- Includes detailed dimension/weight conversion rules
- Uses perplexity/sonar-pro model
- maxTokens: 1000

**File structure:**
```typescript
import { dimensionConversionRules } from "../shared";
import type { PromptConfig } from "../types";

export const PROMPT_META: PromptConfig = { ... };

export interface UrlResearchContext {
  url: string;
}

export function buildPrompt(context: UrlResearchContext): string { ... }
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompt extracted to dedicated file
- [ ] #2 Uses shared dimension conversion fragment
- [ ] #3 PromptConfig metadata included
- [ ] #4 buildPrompt accepts URL context
- [ ] #5 Perplexity model configured
<!-- AC:END -->
