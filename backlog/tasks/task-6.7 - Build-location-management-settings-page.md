---
id: task-6.7
title: Build location management settings page
status: Done
assignee: []
created_date: '2026-01-13 15:07'
updated_date: '2026-01-13 15:40'
labels:
  - ui
  - page
dependencies:
  - task-6.2
parent_task_id: task-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a settings page for users to manage their locations (view, edit, delete, reorder).

## Route
`/settings/locations` or modal from settings

## Page Layout
```
┌────────────────────────────────────────────────────┐
│ ← Settings                                         │
│                                                    │
│ Locations                           [+ Add New]   │
│ Organize where your items are stored              │
├────────────────────────────────────────────────────┤
│ ⋮⋮ 🛋️ Living Room      12 items    [Edit] [···] │
│ ⋮⋮ 🛏️ Bedroom           8 items    [Edit] [···] │
│ ⋮⋮ 🍳 Kitchen            5 items    [Edit] [···] │
│ ⋮⋮ 📦 Storage            0 items    [Edit] [🗑️] │
├────────────────────────────────────────────────────┤
│ 💡 Drag to reorder locations                      │
└────────────────────────────────────────────────────┘
```

## Features

### 1. List View
- Show all locations sorted by sort_order
- Display icon, name, item count
- Drag handle for reordering

### 2. Add New
- Opens modal/dialog with name, icon picker, color picker
- Creates location and adds to list

### 3. Edit Location
- Inline edit or modal
- Change name, icon, color
- Save/cancel buttons

### 4. Delete Location
- Only show delete for locations with 0 items OR
- Show delete with reassignment modal (task-6.8)
- Confirm before delete

### 5. Drag to Reorder
- Use dnd-kit or similar
- Update sort_order on drop
- Optimistic UI update

### 6. Empty State
- "No locations yet"
- "Add your first location" button
- Or "Use defaults" button to seed

## Components Needed
- LocationList (main list)
- LocationListItem (single row)
- LocationEditModal (add/edit form)
- IconPicker (emoji or icon selection)
- ColorPicker (optional, for badge colors)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Settings page lists all user locations
- [ ] #2 Add new location via modal
- [ ] #3 Edit location name/icon/color
- [ ] #4 Delete location (with 0 items)
- [ ] #5 Drag to reorder works
- [ ] #6 Item counts displayed
- [ ] #7 Empty state handled
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
All subtasks completed: task-6.7.1, task-6.7.2, task-6.7.3, task-6.7.4
<!-- SECTION:NOTES:END -->
