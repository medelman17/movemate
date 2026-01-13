---
id: task-6.10
title: Test and polish locations feature
status: Done
assignee: []
created_date: '2026-01-13 15:07'
updated_date: '2026-01-13 16:32'
labels:
  - testing
  - polish
dependencies:
  - task-6.9
parent_task_id: task-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Comprehensive testing and polish for the locations feature.

## Testing Areas

### 1. Unit Tests
- Location server actions (CRUD)
- Validation logic (name length, duplicates)
- Default seeding logic

### 2. Integration Tests
- Create location → appears in selector
- Delete location → items reassigned
- Reorder → persists after refresh

### 3. E2E Tests
- Full flow: create location → add item → view item → edit location
- Migration scenario: old item with text location displays correctly
- Delete with reassignment flow

### 4. Edge Cases to Test
- [ ] Create location with very long name (50+ chars)
- [ ] Create duplicate location name
- [ ] Delete location while adding item (race)
- [ ] Reorder with only 1 location
- [ ] Empty state (no locations)
- [ ] Search with special characters
- [ ] Unicode in location names (emojis, accents)

## Polish Items

### 1. Loading States
- LocationSelector shows skeleton while loading
- Management page shows loading state
- Buttons show loading during mutations

### 2. Error Handling
- Duplicate name error message
- Network error recovery
- Optimistic update rollback

### 3. Accessibility
- Keyboard navigation in selector
- Screen reader labels
- Focus management in modals

### 4. Performance
- Locations cached appropriately
- No unnecessary re-fetches
- Optimistic updates for snappy UX

## Cleanup
- Remove any console.logs
- Ensure TypeScript strict compliance
- Update any outdated comments
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Unit tests for server actions pass
- [ ] #2 E2E test for full location flow
- [ ] #3 Edge cases handled gracefully
- [ ] #4 Loading states implemented
- [ ] #5 Error messages user-friendly
- [ ] #6 Keyboard navigation works
- [ ] #7 No TypeScript errors
- [ ] #8 Build passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
E2E tests passing (3/4), one test skipped tracked in task-6.10.2
<!-- SECTION:NOTES:END -->
