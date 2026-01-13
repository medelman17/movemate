---
id: task-6.4
title: Migrate existing location text to location_id
status: To Do
assignee: []
created_date: '2026-01-13 15:06'
labels:
  - database
  - migration
dependencies:
  - task-6.1
parent_task_id: task-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create migration script to convert existing free-text locations to structured location records.

## Migration Steps

1. **Extract unique locations per user**
   ```sql
   SELECT DISTINCT user_id, location 
   FROM items 
   WHERE location IS NOT NULL AND location != '';
   ```

2. **Create location records**
   - For each unique (user_id, location) pair
   - Generate appropriate icon based on name matching
   - Set sort_order based on creation order

3. **Update items with location_id**
   ```sql
   UPDATE items i
   SET location_id = l.id
   FROM locations l
   WHERE i.user_id = l.user_id 
     AND i.location = l.name;
   ```

4. **Verification**
   - Count items with location_id set vs original location text
   - Report any mismatches

## Icon Matching
```typescript
const ICON_MAP: Record<string, string> = {
  'living': '🛋️',
  'bedroom': '🛏️',
  'kitchen': '🍳',
  'bath': '🚿',
  'dining': '🍽️',
  'office': '💼',
  'garage': '🚗',
  'storage': '📦',
  'outdoor': '🌳',
  'patio': '🌳',
};

function guessIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return '📍'; // default
}
```

## Implementation Options
A. SQL migration script (run in Supabase)
B. TypeScript script (run locally/CI)
C. Server action (run on-demand)

Recommend: TypeScript script that can be run locally with dry-run mode.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Migration script extracts unique locations
- [ ] #2 Location records created with guessed icons
- [ ] #3 Items updated with location_id FK
- [ ] #4 Dry-run mode for testing
- [ ] #5 Verification report shows migration success
- [ ] #6 Original location field preserved for rollback
<!-- AC:END -->
