---
id: task-6.2.6
title: Create getLocationItemCounts action
status: To Do
assignee: []
created_date: '2026-01-13 15:16'
labels:
  - server-actions
dependencies:
  - task-6.1
parent_task_id: task-6.2
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Get item counts per location for UI display.

```typescript
export async function getLocationItemCounts(): Promise<Record<string, number>>
```

## Returns
```typescript
{
  "location-uuid-1": 12,
  "location-uuid-2": 5,
  "location-uuid-3": 0,
  // null key for unassigned items
  "unassigned": 3
}
```

## Implementation
```sql
SELECT location_id, COUNT(*) as count
FROM items
WHERE user_id = auth.uid()
GROUP BY location_id
```

## Usage
- Display item count in location list
- Determine if location can be deleted without reassignment
- Show "unassigned" count in UI
<!-- SECTION:DESCRIPTION:END -->
