---
id: task-4.5
title: Create shared dimension conversion fragment
status: Done
assignee: []
created_date: '2026-01-12 18:23'
updated_date: '2026-01-12 18:31'
labels:
  - prompts
  - shared
dependencies:
  - task-4.1
parent_task_id: task-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `lib/prompts/shared/dimension-conversion.ts` with measurement conversion instructions:

```typescript
export const dimensionConversionRules = `DIMENSION AND WEIGHT CONVERSION:
1. Convert all measurements to inches:
   - From cm: divide by 2.54
   - From mm: divide by 25.4
   - From feet: multiply by 12
   - From meters: multiply by 39.37
2. Convert weight to pounds:
   - From kg: multiply by 2.205
   - From grams: divide by 453.59
   - From oz: divide by 16
3. Return null for any value you cannot determine
4. Round to 2 decimal places`;

export const dimensionFormat = `Dimensions should be returned as:
{
  "length": number | null,  // inches
  "width": number | null,   // inches  
  "height": number | null   // inches
}`;
```

Used by product research prompts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 dimensionConversionRules constant exported
- [ ] #2 dimensionFormat constant exported
- [ ] #3 Exported from shared/index.ts
<!-- AC:END -->
