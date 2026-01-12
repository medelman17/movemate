---
id: task-4.15
title: Create product-research types file
status: Done
assignee: []
created_date: '2026-01-12 18:24'
updated_date: '2026-01-12 18:38'
labels:
  - prompts
  - product-research
  - types
dependencies:
  - task-4.1
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/product-research/types.ts` with shared types:

```typescript
import { z } from "zod";

export const productInfoSchema = z.object({
  name: z.string().describe("Simple generic item name"),
  fullProductName: z.string().describe("Full detailed product name"),
  dimensions: z.object({
    length: z.number().nullable(),
    width: z.number().nullable(),
    height: z.number().nullable(),
  }),
  weight: z.number().nullable(),
  description: z.string().nullable(),
  category: z.enum([
    "Furniture", "Electronics", "Kitchenware", 
    "Clothing", "Books", "Decor", "Tools", "Other"
  ]).nullable(),
  canDisassemble: z.boolean().nullable(),
});

export type ProductInfo = z.infer<typeof productInfoSchema>;

export type ResearchMode = "url" | "search";

export interface ResearchContext {
  input: string;
  mode: ResearchMode;
}
```

Note: This schema already exists in product-research.ts - extract and centralize it.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 productInfoSchema extracted from product-research.ts
- [ ] #2 ProductInfo type exported
- [ ] #3 ResearchMode type defined
- [ ] #4 ResearchContext interface defined
<!-- AC:END -->
