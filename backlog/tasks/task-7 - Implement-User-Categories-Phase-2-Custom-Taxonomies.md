---
id: task-7
title: Implement User Categories (Phase 2 - Custom Taxonomies)
status: To Do
assignee: []
created_date: '2026-01-13 16:20'
labels:
  - feature
  - database
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add structured, user-owned categories to replace hardcoded CATEGORIES array. Users can CRUD their own categories with names and icons. Items reference categories by ID for consistency and filtering.

This is Phase 2 of the custom taxonomies feature, following the same pattern as locations (task-6).

## Goals
- Replace hardcoded categories with structured category selector
- Per-user categories with RLS
- Migration path for existing data
- Category management UI

## Implementation (following locations pattern)
1. Database schema + RLS
2. Server actions (CRUD)
3. Default seeding logic
4. CategorySelector component
5. Integrate into add-item-dialog
6. Settings page with CRUD
7. Delete with reassignment
8. Update item display
9. Migration script
<!-- SECTION:DESCRIPTION:END -->
