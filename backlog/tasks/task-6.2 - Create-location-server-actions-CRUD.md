---
id: task-6.2
title: Create location server actions (CRUD)
status: To Do
assignee: []
created_date: '2026-01-13 15:05'
labels:
  - server-actions
  - api
dependencies:
  - task-6.1
parent_task_id: task-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement server actions for location CRUD operations.

## Actions to Create

```typescript
// app/actions/locations.ts
"use server";

// Create a new location for the current user
export async function createLocation(data: {
  name: string;
  icon?: string;
  color?: string;
}): Promise<Location>

// Get all locations for the current user (sorted)
export async function getLocations(): Promise<Location[]>

// Get a single location by ID
export async function getLocationById(id: string): Promise<Location | null>

// Update a location
export async function updateLocation(
  id: string, 
  data: Partial<Pick<Location, 'name' | 'icon' | 'color'>>
): Promise<Location>

// Delete a location, optionally reassigning items
export async function deleteLocation(
  id: string, 
  reassignToId?: string | null  // null = leave unassigned
): Promise<void>

// Reorder locations (update sort_order)
export async function reorderLocations(
  orderedIds: string[]
): Promise<void>

// Get item counts per location (for UI)
export async function getLocationItemCounts(): Promise<Record<string, number>>
```

## Validation
- Name required, max 50 chars, trimmed
- Name unique per user (handle constraint error gracefully)
- Icon optional, should be emoji or icon name
- Color optional, should be valid hex

## Error Handling
- Duplicate name: throw user-friendly error
- Not found: throw 404-style error
- Unauthorized: RLS handles, but verify user owns location
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 createLocation works with validation
- [ ] #2 getLocations returns sorted list for current user
- [ ] #3 updateLocation validates and updates
- [ ] #4 deleteLocation handles item reassignment
- [ ] #5 reorderLocations updates sort_order correctly
- [ ] #6 getLocationItemCounts returns accurate counts
- [ ] #7 All actions handle errors gracefully
<!-- AC:END -->
