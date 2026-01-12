---
id: task-1.3
title: Replace generateText with generateObject
status: Done
assignee: []
created_date: '2026-01-12 18:01'
updated_date: '2026-01-12 21:14'
labels:
  - ai
  - refactor
dependencies: []
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor the AI call to use Vercel AI SDK's `generateObject` instead of `generateText`:

```typescript
// Before
const { text } = await generateText({...})
const cleanedText = text.trim().replace(/```json\n?/g, "")
const result = JSON.parse(cleanedText)

// After
const { object } = await generateObject({
  model: openai("gpt-4o"),
  schema: identificationSchema,
  prompt: promptText,
})
```

Benefits:
- Guaranteed schema compliance
- No JSON parsing errors
- Faster (no JSON formatting overhead in response)
- Type-safe result
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 generateObject used instead of generateText
- [ ] #2 No manual JSON parsing in the codebase
- [ ] #3 Schema passed to generateObject call
- [ ] #4 Result is fully typed
- [ ] #5 Error handling for schema validation failures
<!-- AC:END -->
