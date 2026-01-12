---
id: task-4.26
title: Write unit tests for utility prompts
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - testing
  - utilities
dependencies:
  - task-4.18
parent_task_id: task-4
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `__tests__/lib/prompts/utilities.test.ts`:

```typescript
import {
  simplifyNameSystemPrompt,
  SIMPLIFY_NAME_META,
} from "@/lib/prompts/utilities";

describe("utility prompts", () => {
  describe("simplify name prompt", () => {
    it("is a system prompt (not empty)", () => {
      expect(simplifyNameSystemPrompt).toBeTruthy();
      expect(simplifyNameSystemPrompt.length).toBeGreaterThan(100);
    });

    it("contains all 9 rules", () => {
      expect(simplifyNameSystemPrompt).toContain("Remove all brand names");
      expect(simplifyNameSystemPrompt).toContain("Remove model names");
      // ... verify all rules present
    });

    it("contains example transformations", () => {
      expect(simplifyNameSystemPrompt).toContain("IKEA KALLAX");
      expect(simplifyNameSystemPrompt).toContain("Shelf Unit");
    });

    it("has correct metadata", () => {
      expect(SIMPLIFY_NAME_META.model).toBe("openai/gpt-4o-mini");
      expect(SIMPLIFY_NAME_META.maxTokens).toBe(50);
    });
  });
});
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test file created
- [ ] #2 System prompt content verified
- [ ] #3 Rules and examples verified
- [ ] #4 Metadata verified
- [ ] #5 All tests pass
<!-- AC:END -->
