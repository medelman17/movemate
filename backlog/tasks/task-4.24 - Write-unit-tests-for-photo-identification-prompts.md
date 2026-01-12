---
id: task-4.24
title: Write unit tests for photo identification prompts
status: Done
assignee: []
created_date: '2026-01-12 18:25'
updated_date: '2026-01-12 21:14'
labels:
  - prompts
  - testing
  - photo-identification
dependencies:
  - task-4.12
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `__tests__/lib/prompts/photo-identification.test.ts` with comprehensive tests:

```typescript
import { 
  buildDetailedPrompt, 
  buildVisualPrompt,
  buildFallbackPrompt,
  identificationOutputSchema,
  DETAILED_META,
  VISUAL_META,
  FALLBACK_META,
} from "@/lib/prompts/photo-identification";

describe("photo identification prompts", () => {
  describe("detailed prompt", () => {
    it("generates prompt without context", () => {...});
    it("injects user context when provided", () => {...});
    it("contains required instruction sections", () => {...});
    it("requests JSON output format", () => {...});
  });

  describe("visual prompt", () => {
    it("generates prompt without context", () => {...});
    it("focuses on visual characteristics", () => {...});
    it("handles edge cases instruction present", () => {...});
  });

  describe("fallback prompt", () => {
    it("is simplest prompt", () => {...});
    it("requests basic category", () => {...});
  });

  describe("output schema", () => {
    it("validates correct output", () => {...});
    it("rejects invalid confidence levels", () => {...});
    it("allows optional clarificationQuestions", () => {...});
  });

  describe("metadata", () => {
    it("all prompts have valid version format", () => {...});
    it("all prompts specify model", () => {...});
  });
});
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test file created
- [ ] #2 All prompt builders tested
- [ ] #3 Output schema validation tested
- [ ] #4 Metadata validation tested
- [ ] #5 All tests pass
<!-- AC:END -->
