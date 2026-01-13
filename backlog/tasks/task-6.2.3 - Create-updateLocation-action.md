---
id: task-6.2.3
title: Create updateLocation action
status: Done
assignee: []
created_date: '2026-01-13 15:16'
updated_date: '2026-01-13 15:18'
labels:
  - server-actions
dependencies:
  - task-6.1
parent_task_id: task-6.2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement location update with validation.

```typescript
export async function updateLocation(
  id: string,
  data: Partial<Pick<Location, 'name' | 'icon' | 'color'>>
): Promise<Location>
```

## Validation
- Same validation as createLocation
- Verify location exists and belongs to user
- Handle unique constraint on name change

## Error Handling
- Not found: "Location not found"
- Duplicate name: "A location with this name already exists"
<!-- SECTION:DESCRIPTION:END -->
