---
id: task-6.2.2
title: Create createLocation action with validation
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
Implement location creation with input validation.

```typescript
export async function createLocation(data: {
  name: string;
  icon?: string;
  color?: string;
}): Promise<Location>
```

## Validation
- Name: required, trim whitespace, max 50 chars
- Icon: optional, should be emoji or icon name
- Color: optional, valid hex format (#RRGGBB)
- Check for duplicate name (unique constraint)

## Error Handling
- Duplicate name: "A location with this name already exists"
- Empty name: "Location name is required"
- Name too long: "Location name must be 50 characters or less"
<!-- SECTION:DESCRIPTION:END -->
