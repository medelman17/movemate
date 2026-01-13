---
id: task-6.5
title: Build LocationSelector component
status: Done
assignee: []
created_date: '2026-01-13 15:06'
updated_date: '2026-01-13 15:21'
labels:
  - ui
  - component
dependencies:
  - task-6.2
parent_task_id: task-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a reusable combobox component for selecting locations with inline creation.

## Component API
```typescript
interface LocationSelectorProps {
  value?: string;  // location_id
  onChange: (locationId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  allowCreate?: boolean;  // default true
  showItemCounts?: boolean;  // default false
}
```

## Features

### 1. Combobox Base
- Use shadcn/ui Combobox (Command + Popover)
- Search/filter locations by name
- Keyboard navigation (arrow keys, enter, escape)

### 2. Display
- Show icon + name for each option
- Optionally show item count badge
- Selected state clearly indicated

### 3. Inline Creation
```
User types "Basement"
┌─────────────────────────────────┐
│ No results found                │
│ ─────────────────────────────── │
│ + Create "Basement"             │  ← click to create
└─────────────────────────────────┘
```

- Appears when search has no matches
- Clicking creates location and selects it
- Shows loading state during creation

### 4. Empty State
- When user has no locations, show prompt to create first
- Or trigger default seeding

### 5. Unassigned Option
- Optional "No location" or "Unassigned" choice
- Maps to null location_id

## Data Fetching
- Use React Query or SWR for caching locations
- Or simple useState with useEffect
- Invalidate cache on create

## Styling
- Match existing shadcn/ui patterns
- Icon + text layout
- Proper focus states
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Combobox shows all user locations
- [x] #2 Search filters locations by name
- [x] #3 Inline create option appears for new names
- [x] #4 Creating location selects it automatically
- [x] #5 Keyboard navigation works
- [x] #6 Loading and error states handled
- [x] #7 Matches existing UI patterns
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completed

Created `components/inventory/location-selector.tsx`:
- Combobox using Command + Popover from shadcn/ui
- Search/filter locations by name
- Inline "Create X" option when typing new name
- Auto-seeds defaults on first load
- Unassigned option support
- Loading and creating states
- Keyboard navigation via cmdk

Also added:
- `components/ui/popover.tsx`
- `components/ui/command.tsx`
<!-- SECTION:NOTES:END -->
