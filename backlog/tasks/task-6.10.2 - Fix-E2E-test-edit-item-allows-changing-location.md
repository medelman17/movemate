---
id: task-6.10.2
title: 'Fix E2E test: edit item allows changing location'
status: To Do
assignee: []
created_date: '2026-01-13 15:58'
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
