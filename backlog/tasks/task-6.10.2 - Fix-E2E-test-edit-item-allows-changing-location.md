---
id: task-6.10.2
title: 'Fix E2E test: edit item allows changing location'
status: Done
assignee: []
created_date: '2026-01-13 15:58'
updated_date: '2026-01-13 19:26'
labels:
  - e2e
  - testing
  - bug
dependencies: []
parent_task_id: task-6.10
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The E2E test "edit item allows changing location" in e2e/locations.spec.ts is skipped because the dropdown menu selector fails to find the Edit menu item.

Issue: The test creates an item with a location, then tries to click the item's dropdown menu to edit it. The button click doesn't open the menu or the menu item selector `[role="menuitem"]:has-text("Edit")` doesn't find the element.

Root cause investigation needed:
1. Check if the button click is actually opening the dropdown
2. Verify the actual rendered HTML structure of the dropdown menu
3. The menu might be using a different role or the selector needs adjustment

Files involved:
- e2e/locations.spec.ts (test file, line 246)
- components/inventory/item-table-row.tsx (table row with menu)
- components/inventory/item-mobile-card.tsx (mobile card with menu)
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completion Notes

Fixed the E2E test 'edit item allows changing location' and other tests in locations.spec.ts:

### Root Cause
Tests were using `#category` selector which no longer exists - the CategorySelector component uses a Popover/Command pattern without an id attribute.

### Changes Made
1. Replaced `#category` selector with proper combobox selector: `page.getByRole('dialog').locator('button[role="combobox"]').first()`
2. Updated dropdown item selector from `[role="option"]` to `[cmdk-item]` (Command menu items)
3. Added waits for category popover to close before clicking location selector
4. Fixed Actions button selector to use `getByRole('button', { name: 'Actions' })` instead of `.first()`
5. Removed unused `selectOption` helper function

All 4 tests now pass:
- settings page shows locations and allows CRUD operations
- LocationSelector allows inline creation in add item dialog
- item displays location badge correctly
- edit item allows changing location
<!-- SECTION:NOTES:END -->
