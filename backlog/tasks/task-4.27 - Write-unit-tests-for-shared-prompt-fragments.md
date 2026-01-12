---
id: task-4.27
title: Write unit tests for shared prompt fragments
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - testing
  - shared
dependencies:
  - task-4.7
parent_task_id: task-4
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `__tests__/lib/prompts/shared.test.ts`:

```typescript
import {
  jsonOutputInstruction,
  jsonOnlyReminder,
  confidenceLevels,
  confidenceLevelsCompact,
  dimensionConversionRules,
  movingInventoryContext,
  itemCategories,
} from "@/lib/prompts/shared";
import { z } from "zod";

describe("shared prompt fragments", () => {
  describe("jsonOutputInstruction", () => {
    it("generates instruction from Zod schema", () => {
      const schema = z.object({ name: z.string() });
      const instruction = jsonOutputInstruction(schema);
      expect(instruction).toContain("name");
      expect(instruction).toContain("string");
    });
  });

  describe("confidence levels", () => {
    it("defines HIGH, MEDIUM, LOW", () => {
      expect(confidenceLevels).toContain("HIGH");
      expect(confidenceLevels).toContain("MEDIUM");
      expect(confidenceLevels).toContain("LOW");
    });

    it("compact version is shorter", () => {
      expect(confidenceLevelsCompact.length).toBeLessThan(confidenceLevels.length);
    });
  });

  describe("dimension conversion", () => {
    it("includes cm to inches conversion", () => {
      expect(dimensionConversionRules).toContain("2.54");
    });

    it("includes kg to pounds conversion", () => {
      expect(dimensionConversionRules).toContain("2.205");
    });
  });

  describe("item categories", () => {
    it("includes expected categories", () => {
      expect(itemCategories).toContain("Furniture");
      expect(itemCategories).toContain("Electronics");
    });
  });
});
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test file created
- [ ] #2 JSON output helper tested
- [ ] #3 Confidence levels tested
- [ ] #4 Dimension conversion tested
- [ ] #5 Categories tested
- [ ] #6 All tests pass
<!-- AC:END -->
