---
id: task-6.6
title: Integrate LocationSelector into add-item-dialog
status: Done
assignee: []
created_date: '2026-01-13 15:06'
updated_date: '2026-01-13 15:24'
labels:
  - ui
  - integration
dependencies:
  - task-6.5
parent_task_id: task-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the free-text location input in add-item-dialog with the new LocationSelector component.

## Current State
```tsx
// add-item-dialog.tsx
<Input
  placeholder="e.g., Living Room, Kitchen, Garage"
  {...register("location")}
/>
```

## Target State
```tsx
<LocationSelector
  value={locationId}
  onChange={(id) => setValue("location_id", id)}
  allowCreate={true}
/>
```

## Changes Required

### 1. Form Schema Update
```typescript
// Update Zod schema
const formSchema = z.object({
  // ... existing fields
  location: z.string().optional(),      // keep for now (deprecated)
  location_id: z.string().nullable(),   // new field
});
```

### 2. Form State
- Add location_id to form defaults
- Handle null for "unassigned"

### 3. Submit Handler
- Send location_id instead of location text
- Update createItem action to accept location_id

### 4. AI Integration
- When AI identifies item, it doesn't set location
- Location is user's choice based on where item IS
- No changes needed to photo identification

### 5. Pre-selection
- If dialog opened from a location context, pre-select that location
- E.g., "Add item to Living Room" pre-selects Living Room

## Testing
- Create item with existing location
- Create item with new location (inline create)
- Create item with no location
- Verify item appears with correct location
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 LocationSelector replaces text input
- [ ] #2 Form schema updated for location_id
- [ ] #3 Submit sends location_id to server
- [ ] #4 Inline creation works from dialog
- [ ] #5 Pre-selection works when context provided
- [ ] #6 Backward compatible with existing items
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed: Integrated LocationSelector into add-item-dialog

- Added LocationSelector import

- Added location_id to formData state (initial and reset)

- Replaced hardcoded LOCATIONS Select with LocationSelector component

- Removed unused LOCATIONS constant

- Build passes successfully
<!-- SECTION:NOTES:END -->
