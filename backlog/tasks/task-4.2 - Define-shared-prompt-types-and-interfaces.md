---
id: task-4.2
title: Define shared prompt types and interfaces
status: To Do
assignee: []
created_date: '2026-01-12 18:23'
labels:
  - prompts
  - types
dependencies:
  - task-4.1
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/types.ts` with core TypeScript types:

```typescript
export interface PromptConfig {
  id: string;
  version: string;
  model: string;
  maxTokens: number;
  description: string;
  changelog: Array<{
    version: string;
    date: string;
    change: string;
  }>;
}

export type PromptBuilder<TContext = void> = TContext extends void
  ? () => string
  : (context: TContext) => string;

export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature?: number;
}

export type PromptStrategy = "detailed" | "visual" | "fallback";
export type ResearchMode = "url" | "search";
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 PromptConfig interface defined
- [ ] #2 PromptBuilder generic type defined
- [ ] #3 ModelConfig interface defined
- [ ] #4 All types exported from index.ts
<!-- AC:END -->
