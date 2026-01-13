---
id: task-6.9
title: Update item display to show structured location
status: To Do
assignee: []
created_date: '2026-01-13 15:07'
labels:
  - ui
  - integration
dependencies:
  - task-6.6
parent_task_id: task-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update all places where items are displayed to show the location from the locations table instead of raw text.

## Places to Update

### 1. Inventory List (Main Page)
- Show location badge with icon
- Filter by location dropdown
- Group by location option?

### 2. Item Card Component
```tsx
// Before
<span>{item.location}</span>

// After
<LocationBadge location={item.location_obj} />
// or
<span>{item.location_obj?.icon} {item.location_obj?.name}</span>
```

### 3. Item Detail View
- Show full location name with icon
- Link to filter by that location?

### 4. Edit Item Form
- Use LocationSelector (same as add)

## Data Loading

### Option A: Join in Query
```sql
SELECT items.*, 
       locations.name as location_name,
       locations.icon as location_icon
FROM items
LEFT JOIN locations ON items.location_id = locations.id
```

### Option B: Separate Query
- Fetch locations once
- Map location_id to location object client-side

### Option C: Expand in Server Action
```typescript
const items = await getItems();
const locations = await getLocations();
return items.map(item => ({
  ...item,
  location_obj: locations.find(l => l.id === item.location_id)
}));
```

Recommend Option A (join) for efficiency.

## Backward Compatibility
- If item has location (text) but no location_id, show text as fallback
- After migration runs, all items should have location_id

## LocationBadge Component
```typescript
interface LocationBadgeProps {
  location: Location | null;
  showIcon?: boolean;  // default true
  size?: 'sm' | 'md';
}

// Renders: 🛋️ Living Room
// Or: "Unassigned" if null
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Item list shows location with icon
- [ ] #2 Item cards display location badge
- [ ] #3 Edit item uses LocationSelector
- [ ] #4 Fallback to text location if no location_id
- [ ] #5 LocationBadge component created
- [ ] #6 Unassigned items handled gracefully
<!-- AC:END -->
