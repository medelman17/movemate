---
id: task-1.7
title: Implement store_search strategy
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - feature
  - ux
dependencies: []
parent_task_id: task-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When `store_search` is the best strategy, narrow down by retailer:

**Primary question:**
"Where did you buy this?" with options:
- IKEA
- West Elm
- CB2
- Crate & Barrel
- Pottery Barn
- Wayfair
- Amazon
- Target
- Walmart
- Ashley Furniture
- Article
- Joybird
- Other (text input)

**Secondary question:**
"What was the approximate price?" with ranges:
- Under $100
- $100-$300
- $300-$500
- $500-$1000
- $1000-$2000
- Over $2000

**Search construction:**
Combine retailer + item type + distinctive features + price range for targeted Perplexity query.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Retailer dropdown with common furniture stores
- [ ] #2 Price range selector
- [ ] #3 Search query uses retailer context
- [ ] #4 Other option allows text input
- [ ] #5 Works for different item categories (furniture vs electronics retailers)
<!-- AC:END -->
