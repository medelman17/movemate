---
id: task-6.8
title: Implement location delete with item reassignment
status: Done
assignee: []
created_date: '2026-01-13 15:07'
updated_date: '2026-01-13 15:36'
labels:
  - ui
  - component
dependencies:
  - task-6.7
parent_task_id: task-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Handle deleting locations that have items assigned to them.

## Delete Flow

### Case 1: Location has 0 items
- Simple delete confirmation
- "Delete 'Storage'? This location has no items."
- [Cancel] [Delete]

### Case 2: Location has items
```
┌─────────────────────────────────────────────┐
│ Delete "Living Room"?                       │
├─────────────────────────────────────────────┤
│ This location has 12 items.                 │
│                                             │
│ What should happen to these items?          │
│                                             │
│ ○ Move to another location:                 │
│   [Bedroom                            ▼]    │
│                                             │
│ ○ Leave items unassigned                    │
│   Items will have no location               │
├─────────────────────────────────────────────┤
│                    [Cancel] [Delete]        │
└─────────────────────────────────────────────┘
```

## Implementation

### 1. DeleteLocationModal Component
```typescript
interface DeleteLocationModalProps {
  location: Location;
  itemCount: number;
  otherLocations: Location[];
  onConfirm: (reassignToId: string | null) => void;
  onCancel: () => void;
}
```

### 2. Server Action Update
`deleteLocation(id, reassignToId)` already supports this:
- If reassignToId provided: UPDATE items SET location_id = reassignToId WHERE location_id = id
- If null: UPDATE items SET location_id = NULL WHERE location_id = id
- Then DELETE location

### 3. Validation
- Can't reassign to the location being deleted
- Reassign target must exist and belong to user

## Edge Cases
- Deleting while items are being added (race condition) - use transaction
- Reassign to location that gets deleted simultaneously - FK constraint handles
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Modal shows item count for location
- [ ] #2 User can choose reassignment target
- [ ] #3 User can choose to leave unassigned
- [ ] #4 Delete updates items before removing location
- [ ] #5 Cannot reassign to self
- [ ] #6 Proper error handling
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed via task-6.8.1
<!-- SECTION:NOTES:END -->
