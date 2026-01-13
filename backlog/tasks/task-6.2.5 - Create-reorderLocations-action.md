---
id: task-6.2.5
title: Create reorderLocations action
status: Done
assignee: []
created_date: '2026-01-13 15:16'
updated_date: '2026-01-13 15:18'
labels:
  - server-actions
dependencies:
  - task-6.1
parent_task_id: task-6.2
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement bulk reordering of locations.

```typescript
export async function reorderLocations(
  orderedIds: string[]
): Promise<void>
```

## Logic
1. Validate all IDs belong to current user
2. Update sort_order for each location based on array index
3. Use transaction or batch update for consistency

## Implementation Options
A. Loop with individual updates (simple, more queries)
B. Single UPDATE with CASE statement (efficient)
C. Use Supabase's upsert with conflict handling

## Error Handling
- Invalid ID in list: skip or throw error
- Missing locations: only update provided IDs
<!-- SECTION:DESCRIPTION:END -->
