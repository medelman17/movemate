---
id: task-4.25
title: Write unit tests for product research prompts
status: Done
assignee: []
created_date: '2026-01-12 18:25'
updated_date: '2026-01-12 21:14'
labels:
  - prompts
  - testing
  - product-research
dependencies:
  - task-4.16
parent_task_id: task-4
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `__tests__/lib/prompts/product-research.test.ts` with comprehensive tests:

```typescript
import {
  buildUrlPrompt,
  buildSearchPrompt,
  buildResearchPrompt,
  productInfoSchema,
  URL_META,
  SEARCH_META,
} from "@/lib/prompts/product-research";

describe("product research prompts", () => {
  describe("URL-based prompt", () => {
    it("includes the provided URL", () => {...});
    it("contains dimension conversion rules", () => {...});
    it("requests JSON output format", () => {...});
    it("includes example output structure", () => {...});
  });

  describe("search-based prompt", () => {
    it("includes the product name", () => {...});
    it("instructs to search manufacturer sites", () => {...});
    it("contains dimension conversion rules", () => {...});
  });

  describe("buildResearchPrompt helper", () => {
    it("returns URL prompt for URLs", () => {...});
    it("returns search prompt for non-URLs", () => {...});
  });

  describe("productInfoSchema", () => {
    it("validates complete product info", () => {...});
    it("allows null dimensions", () => {...});
    it("validates category enum", () => {...});
  });
});
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test file created
- [ ] #2 URL and search prompts tested
- [ ] #3 Schema validation tested
- [ ] #4 Helper function tested
- [ ] #5 All tests pass
<!-- AC:END -->
