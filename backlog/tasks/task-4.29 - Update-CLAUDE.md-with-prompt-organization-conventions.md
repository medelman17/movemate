---
id: task-4.29
title: Update CLAUDE.md with prompt organization conventions
status: Done
assignee: []
created_date: '2026-01-12 18:25'
updated_date: '2026-01-12 21:14'
labels:
  - prompts
  - documentation
dependencies:
  - task-4.21
  - task-4.22
  - task-4.23
parent_task_id: task-4
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a new section to CLAUDE.md documenting the prompt organization system:

```markdown
### Prompt Organization

All AI prompts are centralized in `lib/prompts/`:

```
lib/prompts/
├── index.ts              # Central exports
├── types.ts              # Shared types (PromptConfig, PromptBuilder)
├── config.ts             # Model configurations
├── shared/               # Reusable prompt fragments
├── photo-identification/ # Photo analysis prompts
├── product-research/     # Product lookup prompts
└── utilities/            # Helper prompts (name simplification)
```

**Adding a new prompt:**
1. Create file in appropriate subdirectory
2. Define PROMPT_META with id, version, model, maxTokens
3. Define Zod output schema if structured output expected
4. Export buildPrompt function accepting typed context
5. Add to subdirectory index.ts exports
6. Write unit tests

**Prompt conventions:**
- Use shared fragments for common instructions
- Include version in metadata for tracking
- Co-locate Zod schemas with prompts
- Keep prompts focused on single responsibility
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CLAUDE.md updated with prompt section
- [ ] #2 Directory structure documented
- [ ] #3 Adding new prompt process documented
- [ ] #4 Conventions documented
<!-- AC:END -->
