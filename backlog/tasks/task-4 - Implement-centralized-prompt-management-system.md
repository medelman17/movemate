---
id: task-4
title: Implement centralized prompt management system
status: To Do
assignee: []
created_date: '2026-01-12 18:23'
labels:
  - refactor
  - dx
  - prompts
  - architecture
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactor all AI prompts from inline strings scattered across server actions into a centralized, typed, versioned prompt management system in `lib/prompts/`.

**Current State:**
- 6 prompts across 3 files, all inline
- No version tracking, no testing, no composition
- ~1,400 tokens of prompt content embedded in business logic

**Target State:**
- Centralized `lib/prompts/` directory with typed prompt builders
- Shared fragments for common instructions  
- Zod schemas co-located with prompts
- Metadata for versioning and model configuration
- Unit-testable prompt generation

See doc-1 (Prompt Organization Implementation Plan) for full architecture details.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All prompts extracted to lib/prompts/
- [ ] #2 Zero behavior changes in existing functionality
- [ ] #3 Each prompt has typed builder function
- [ ] #4 Each prompt has co-located Zod schema
- [ ] #5 Each prompt has metadata with version info
- [ ] #6 Shared fragments eliminate duplication
- [ ] #7 Server actions import prompts cleanly
- [ ] #8 Unit tests cover prompt generation
- [ ] #9 Documentation updated
<!-- AC:END -->
