---
id: task-6.2.1
title: Create getLocations and getLocationById actions
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
Implement read operations for locations.

```typescript
// Get all locations for current user, sorted by sort_order
export async function getLocations(): Promise<Location[]>

// Get single location by ID (returns null if not found/not owned)
export async function getLocationById(id: string): Promise<Location | null>
```

## Implementation
- Use server-side Supabase client
- RLS handles user filtering automatically
- Order by sort_order ASC
- Handle empty result gracefully
<!-- SECTION:DESCRIPTION:END -->
