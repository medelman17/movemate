---
id: task-6.7.4
title: Implement drag-to-reorder with dnd-kit
status: Done
assignee: []
created_date: '2026-01-13 15:30'
updated_date: '2026-01-13 15:40'
labels:
  - ui
  - feature
dependencies:
  - task-6.7.2
parent_task_id: task-6.7
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add drag-and-drop reordering using @dnd-kit/core and @dnd-kit/sortable. Update sort_order on drop via reorderLocations server action. Use optimistic updates.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 dnd-kit installed
- [x] #2 Items can be dragged
- [x] #3 Order persists after drop
- [x] #4 Optimistic UI update
- [x] #5 Order persists after page refresh
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed: Implemented drag-to-reorder with dnd-kit

- Installed @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

- Created SortableLocationItem component with useSortable hook

- DndContext wraps location list with closestCenter collision detection

- SortableContext with verticalListSortingStrategy

- handleDragEnd uses arrayMove for optimistic update

- Calls reorderLocations server action to persist

- Reverts on error

- Keyboard navigation supported

- Build passes
<!-- SECTION:NOTES:END -->
