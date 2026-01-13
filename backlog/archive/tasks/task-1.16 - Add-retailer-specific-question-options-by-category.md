---
id: task-1.16
title: Add retailer-specific question options by category
status: To Do
assignee: []
created_date: '2026-01-12 18:01'
labels:
  - data
  - ux
dependencies: []
parent_task_id: task-1
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Different item categories have different common retailers. Customize the "Where did you buy this?" options:

**Furniture:**
IKEA, West Elm, CB2, Crate & Barrel, Pottery Barn, Wayfair, Amazon, Target, Ashley Furniture, Article, Joybird, Rooms To Go, Bob's Discount Furniture, Other

**Electronics:**
Best Buy, Amazon, Costco, Walmart, Target, Apple Store, Samsung Store, Micro Center, B&H Photo, Other

**Appliances:**
Home Depot, Lowe's, Best Buy, Costco, Amazon, AJ Madison, Appliances Connection, Other

**Mattresses:**
Casper, Purple, Tuft & Needle, Saatva, Tempur-Pedic, Sleep Number, Mattress Firm, Costco, Amazon, Other

Store in a configuration object keyed by category.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Retailer options vary by item category
- [ ] #2 Common retailers for each category included
- [ ] #3 Other option always available
- [ ] #4 Easy to extend with new categories/retailers
<!-- AC:END -->
