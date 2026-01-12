---
id: task-1.14
title: Handle user answers and continue identification
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - feature
  - logic
dependencies: []
parent_task_id: task-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create function to process user's answers and continue identification flow:

```typescript
async function continueIdentification(
  originalAnalysis: IdentificationResult,
  answers: Record<string, string | string[]>
): Promise<string | ClarificationRequest>
```

**Logic:**
1. Merge answers with original analysis
2. If `check_label` and user found label: Search by brand/model directly
3. If `store_search` and user provided retailer: Targeted Perplexity search
4. If answers still insufficient: May ask one more follow-up or use estimates
5. Return final product name or another clarification request

**Answer handling by strategy:**
- `check_label`: Parse label text for brand/model
- `purchase_history`: Extract product name from order text
- `store_search`: Build "{retailer} {type} {features} {price}" query
- `feature_match`: Refine search with user-confirmed features
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Accepts answers keyed by question ID
- [ ] #2 Merges with original analysis
- [ ] #3 Routes to appropriate search based on strategy
- [ ] #4 Limits follow-up rounds (max 2 total)
- [ ] #5 Returns final result or falls back to estimates
<!-- AC:END -->
