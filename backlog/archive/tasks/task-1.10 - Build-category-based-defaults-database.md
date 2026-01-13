---
id: task-1.10
title: Build category-based defaults database
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - data
  - feature
dependencies: []
parent_task_id: task-1
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a lookup table of typical dimensions/weights by item category for fallback estimates:

```typescript
const categoryDefaults: Record<string, ItemDefaults> = {
  "Sofa": { length: 84, width: 36, height: 34, weight: 150 },
  "Loveseat": { length: 60, width: 34, height: 34, weight: 100 },
  "Sectional": { length: 110, width: 85, height: 34, weight: 200 },
  "Armchair": { length: 34, width: 32, height: 34, weight: 60 },
  "Coffee Table": { length: 48, width: 24, height: 18, weight: 50 },
  "Dining Table": { length: 72, width: 42, height: 30, weight: 100 },
  "Bookshelf": { length: 36, width: 12, height: 72, weight: 80 },
  "Dresser": { length: 60, width: 18, height: 34, weight: 120 },
  "Bed Frame (Queen)": { length: 84, width: 64, height: 50, weight: 100 },
  "TV Stand": { length: 60, width: 18, height: 24, weight: 70 },
  // ... etc
}
```

Include `canDisassemble`, `fragile`, and `requiresTwoPersonLift` defaults per category.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Defaults for all common furniture categories
- [ ] #2 Defaults for electronics (TVs, monitors, etc.)
- [ ] #3 Defaults for appliances
- [ ] #4 Includes handling characteristics (fragile, two-person, disassembly)
- [ ] #5 Easy to extend with new categories
<!-- AC:END -->
