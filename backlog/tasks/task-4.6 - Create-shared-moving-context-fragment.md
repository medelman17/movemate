---
id: task-4.6
title: Create shared moving context fragment
status: To Do
assignee: []
created_date: '2026-01-12 18:23'
labels:
  - prompts
  - shared
dependencies:
  - task-4.1
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/shared/moving-context.ts` with domain-specific context:

```typescript
export const movingInventoryContext = `You are assisting with a moving inventory application. Your goal is to help identify and catalog household items for moving purposes.

Key considerations:
- Items need accurate dimensions and weight for moving estimates
- Simple, recognizable names help movers identify items
- Detailed product info helps with insurance and replacement value`;

export const itemCategories = [
  "Furniture",
  "Electronics", 
  "Kitchenware",
  "Clothing",
  "Books",
  "Decor",
  "Tools",
  "Other"
] as const;

export type ItemCategory = typeof itemCategories[number];

export const categoryExamples: Record<ItemCategory, string[]> = {
  Furniture: ["Sofa", "Dining Table", "Bed Frame", "Bookshelf"],
  Electronics: ["TV", "Computer", "Gaming Console", "Speaker"],
  // ... etc
};
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 movingInventoryContext constant exported
- [ ] #2 itemCategories array exported
- [ ] #3 ItemCategory type exported
- [ ] #4 categoryExamples mapping available
<!-- AC:END -->
