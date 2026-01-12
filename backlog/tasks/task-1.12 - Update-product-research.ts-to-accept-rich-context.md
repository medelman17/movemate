---
id: task-1.12
title: Update product-research.ts to accept rich context
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - ai
  - refactor
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify the Perplexity research function to use context from strategic questions:

**Current signature:**
```typescript
async function researchProduct(productName: string): Promise<ProductSpecs>
```

**New signature:**
```typescript
interface ResearchContext {
  itemType: string
  retailer?: string
  priceRange?: string
  features?: string[]
  userProvidedName?: string  // From label or receipt
  styleFamily?: string
}

async function researchProduct(context: ResearchContext): Promise<ProductSpecs>
```

**Query construction:**
- If `userProvidedName`: Search directly for that product
- If `retailer`: "{retailer} {itemType} {features}"
- Otherwise: "{itemType} {styleFamily} {features} specifications"

Skip research entirely if strategy is `use_estimates`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Accepts rich context object instead of just product name
- [ ] #2 Query construction uses available context intelligently
- [ ] #3 Handles missing optional fields gracefully
- [ ] #4 Backward compatible with existing callers
- [ ] #5 Can skip research when not needed
<!-- AC:END -->
