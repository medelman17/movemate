---
id: task-4.20
title: Create prompts config file with model defaults
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - config
dependencies:
  - task-4.2
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/config.ts` with centralized model configuration:

```typescript
import type { ModelConfig } from "./types";

export const modelConfigs = {
  // Vision model for photo analysis
  vision: {
    model: "openai/gpt-4o",
    maxTokens: 400,
    temperature: 0.3,
  } satisfies ModelConfig,

  // Web search model for product research
  webSearch: {
    model: "perplexity/sonar-pro",
    maxTokens: 1000,
    temperature: 0.2,
  } satisfies ModelConfig,

  // Fast/cheap model for simple tasks
  fast: {
    model: "openai/gpt-4o-mini",
    maxTokens: 50,
    temperature: 0.1,
  } satisfies ModelConfig,
} as const;

export type ModelType = keyof typeof modelConfigs;

export function getModelConfig(type: ModelType): ModelConfig {
  return modelConfigs[type];
}
```

This centralizes model selection so prompts can reference configs by name.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Model configs centralized
- [ ] #2 Vision config matches current gpt-4o usage
- [ ] #3 WebSearch config matches current perplexity usage
- [ ] #4 Fast config matches current gpt-4o-mini usage
<!-- AC:END -->
