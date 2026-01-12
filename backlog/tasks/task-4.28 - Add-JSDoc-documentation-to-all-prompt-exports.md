---
id: task-4.28
title: Add JSDoc documentation to all prompt exports
status: To Do
assignee: []
created_date: '2026-01-12 18:25'
labels:
  - prompts
  - documentation
dependencies:
  - task-4.19
parent_task_id: task-4
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add comprehensive JSDoc comments to all exported functions, types, and constants in `lib/prompts/`:

**Example:**
```typescript
/**
 * Builds the detailed photo identification prompt.
 * 
 * This strategy attempts to identify products by looking for:
 * - Brand logos and labels
 * - Model numbers
 * - Distinctive features
 * 
 * Best used as the first attempt when analyzing product photos.
 * 
 * @param context - Optional context to improve identification
 * @param context.userContext - User-provided description or hints
 * @returns The formatted prompt string ready for the vision model
 * 
 * @example
 * ```typescript
 * const prompt = buildDetailedPrompt({ userContext: "This is my IKEA bookshelf" });
 * ```
 */
export function buildDetailedPrompt(context: DetailedPromptContext): string {
```

Add JSDoc to:
- All prompt builder functions
- All exported types and interfaces
- All shared fragments
- All config objects
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All builder functions have JSDoc
- [ ] #2 All types have JSDoc
- [ ] #3 All shared fragments have JSDoc
- [ ] #4 Examples included where helpful
- [ ] #5 IDE intellisense shows documentation
<!-- AC:END -->
