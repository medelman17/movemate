---
id: task-6
title: Implement User Locations (Phase 1 - Custom Taxonomies)
status: Done
assignee: []
created_date: '2026-01-13 15:05'
updated_date: '2026-01-13 16:32'
labels:
  - feature
  - database
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add structured, user-owned locations to replace free-text location field on items. Users can CRUD their own locations with names, icons, and colors. Items reference locations by ID for consistency and filtering.

This is Phase 1 of the custom taxonomies feature. Categories, retailers, and tags will follow the same pattern in later phases.

## Goals
- Replace free-text location with structured location selector
- Per-user locations with RLS
- Migration path for existing data
- Location management UI

## Non-Goals (Phase 1)
- Hierarchical locations
- Location types (room vs storage vs vehicle)
- Sharing locations across users
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Users can create, read, update, delete their own locations
- [x] #2 Items reference locations by ID with proper FK
- [x] #3 LocationSelector component with inline creation
- [x] #4 Location management page in settings
- [x] #5 Existing free-text locations migrated to structured records
- [x] #6 Default locations seeded for new users
- [x] #7 Delete handling with item reassignment option
- [x] #8 RLS policies enforce user isolation
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Order

### Phase A: Foundation (task-6.1 → task-6.2 → task-6.3)
1. **task-6.1** - Database schema + RLS
2. **task-6.2** - Server actions (CRUD)
3. **task-6.3** - Default seeding logic

### Phase B: Migration (task-6.4)
4. **task-6.4** - Migrate existing text locations

### Phase C: Core UI (task-6.5 → task-6.6)
5. **task-6.5** - LocationSelector component
6. **task-6.6** - Integrate into add-item-dialog

### Phase D: Management UI (task-6.7 → task-6.8)
7. **task-6.7** - Settings page
8. **task-6.8** - Delete with reassignment

### Phase E: Polish (task-6.9 → task-6.10)
9. **task-6.9** - Update item display
10. **task-6.10** - Testing and polish

## Dependency Graph
```
task-6.1 (schema)
    ↓
task-6.2 (server actions) ←── task-6.4 (migration)
    ↓
task-6.3 (seeding)
    ↓
task-6.5 (LocationSelector)
    ↓
task-6.6 (add-item integration)
    ↓
task-6.9 (item display)
    ↓
task-6.10 (testing)

task-6.2 → task-6.7 (settings page) → task-6.8 (delete modal)
```
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Completed 2026-01-13: All components implemented, migration ran successfully (25 items across 2 users).
<!-- SECTION:NOTES:END -->
