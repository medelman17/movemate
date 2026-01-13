---
id: task-6.2.4
title: Create deleteLocation action with item reassignment
status: To Do
assignee: []
created_date: '2026-01-13 15:16'
labels:
  - server-actions
dependencies:
  - task-6.1
parent_task_id: task-6.2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement location deletion with optional item reassignment.

```typescript
export async function deleteLocation(
  id: string,
  reassignToId?: string | null  // null = leave items unassigned
): Promise<void>
```

## Logic
1. Verify location exists and belongs to user
2. If reassignToId provided:
   - Verify target location exists and belongs to user
   - UPDATE items SET location_id = reassignToId WHERE location_id = id
3. If reassignToId is null or undefined:
   - Items will have location_id set to NULL (via ON DELETE SET NULL)
4. DELETE the location

## Error Handling
- Not found: "Location not found"
- Reassign to self: "Cannot reassign items to the location being deleted"
- Invalid reassign target: "Target location not found"
<!-- SECTION:DESCRIPTION:END -->
