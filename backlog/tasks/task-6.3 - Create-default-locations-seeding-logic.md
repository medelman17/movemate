---
id: task-6.3
title: Create default locations seeding logic
status: Done
assignee: []
created_date: '2026-01-13 15:06'
updated_date: '2026-01-13 15:19'
labels:
  - server-actions
dependencies:
  - task-6.2
parent_task_id: task-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement logic to seed default locations for users.

## Default Locations
```typescript
const DEFAULT_LOCATIONS = [
  { name: "Living Room", icon: "🛋️", sort_order: 0 },
  { name: "Bedroom", icon: "🛏️", sort_order: 1 },
  { name: "Kitchen", icon: "🍳", sort_order: 2 },
  { name: "Bathroom", icon: "🚿", sort_order: 3 },
  { name: "Dining Room", icon: "🍽️", sort_order: 4 },
  { name: "Office", icon: "💼", sort_order: 5 },
  { name: "Garage", icon: "🚗", sort_order: 6 },
  { name: "Storage", icon: "📦", sort_order: 7 },
  { name: "Outdoor", icon: "🌳", sort_order: 8 },
];
```

## Seeding Strategy: Lazy Initialization
- Don't seed on user signup (too early, adds latency)
- Seed when user first accesses locations AND has none
- Server action: `seedDefaultLocations()` - only creates if user has 0 locations

## Implementation
```typescript
export async function seedDefaultLocationsIfNeeded(): Promise<Location[]> {
  const existing = await getLocations();
  if (existing.length > 0) {
    return existing; // Already has locations
  }
  
  // Batch insert defaults
  return await createDefaultLocations();
}
```

## Usage
- Call from getLocations() if empty? Or explicit call from UI?
- Recommend: explicit call when LocationSelector mounts with empty list
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Default locations defined with icons
- [x] #2 seedDefaultLocationsIfNeeded only seeds when user has none
- [x] #3 Seeding is idempotent (safe to call multiple times)
- [x] #4 Defaults include common room types
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completed

Added to `app/actions/locations.ts`:
- `DEFAULT_LOCATIONS` constant with 9 common room types
- `seedDefaultLocationsIfNeeded()` - idempotent seeding function

Default locations: Living Room, Bedroom, Kitchen, Bathroom, Dining Room, Office, Garage, Storage, Outdoor
<!-- SECTION:NOTES:END -->
