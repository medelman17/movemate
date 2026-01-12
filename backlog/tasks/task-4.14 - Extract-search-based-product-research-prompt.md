---
id: task-4.14
title: Extract search-based product research prompt
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
Create `lib/prompts/product-research/search-based.ts` by extracting the search research prompt from `app/actions/product-research.ts:90-133`.

**Source prompt location:** Lines 90-133 in product-research.ts

**Key characteristics:**
- Takes a product name/description as input
- Instructs to search web for real specifications
- Extracts two names (simple + full)
- Includes dimension/weight conversion rules
- Uses perplexity/sonar-pro model
- maxTokens: 1000

**File structure mirrors url-based.ts with search-specific content.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Prompt extracted to dedicated file
- [ ] #2 Uses shared dimension conversion fragment
- [ ] #3 PromptConfig metadata included
- [ ] #4 buildPrompt accepts search context
- [ ] #5 Perplexity model configured
<!-- AC:END -->
