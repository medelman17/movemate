---
id: task-1
title: Redesign photo identification with strategic questioning flow
status: To Do
assignee: []
created_date: '2026-01-12 17:58'
updated_date: '2026-01-12 17:58'
labels:
  - ai
  - performance
  - ux
  - refactor
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current `identify-from-photo.ts` implementation is slow and lackluster. It uses a 3-attempt sequential strategy (detailed → visual → fallback) that makes up to 3 GPT-4o calls, taking 10-20 seconds worst case. It also relies on finding visible brand labels, which almost never happens in practice.

**Current Problems:**
- Sequential multi-attempt strategy (up to 3 GPT-4o vision calls)
- Uses `generateText` with manual JSON parsing instead of `generateObject` with Zod
- Self-reported AI confidence is unreliable
- Asks generic clarification questions ("take another photo") instead of strategic ones
- Brand labels are rarely visible, making the current approach ineffective

**Proposed Solution: Detective Approach**
Instead of hoping to see a brand label, treat the photo as a starting point and gather identifying information through strategic questions:

1. Single GPT-4o call to identify item type + distinctive features + determine best identification strategy
2. Ask high-value questions based on strategy:
   - "Where did you buy this?" (narrows to one retailer's catalog)
   - "Can you check for a tag under the cushions?" (direct identification)
   - "Do you have the order confirmation email?" (exact product)
   - "Approximate price range?" (narrows within catalog)
3. Use answers to construct targeted Perplexity search
4. Fall back to visual estimates only when identification fails

**Key Insight:** One strategic question ("Where did you buy this?") is worth more than three photo retakes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Single GPT-4o call for initial analysis (not 3 sequential attempts)
- [ ] #2 Use generateObject with Zod schema instead of generateText with manual JSON parsing
- [ ] #3 Implement strategy-based questioning (check_label, purchase_history, store_search, feature_match, use_estimates)
- [ ] #4 Questions are contextual and high-value, not generic
- [ ] #5 Perplexity search uses rich context from user answers
- [ ] #6 Visual estimates available as fallback for generic items
- [ ] #7 Response time under 4 seconds for initial analysis
- [ ] #8 Maintain backward compatibility with existing UI expectations
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Phase 1: Schema Design
Define Zod schemas for structured output:

```typescript
const identificationSchema = z.object({
  // What we know from the photo
  itemType: z.string(),
  category: z.enum(["Furniture", "Electronics", "Appliances", ...]),
  
  distinctiveFeatures: z.array(z.string()),
  styleFamily: z.string(),
  
  // Visual fallback estimates
  visualEstimates: z.object({
    dimensions: z.object({ length: z.number(), width: z.number(), height: z.number() }),
    weightLbs: z.number(),
    canDisassemble: z.boolean(),
  }),
  
  // Strategy for identification
  strategy: z.object({
    approach: z.enum(["check_label", "purchase_history", "store_search", "feature_match", "use_estimates"]),
    confidence: z.number(),
    questions: z.array(z.object({
      question: z.string(),
      rationale: z.string(),
      inputType: z.enum(["text", "select", "photo"]),
      options: z.array(z.string()).optional(),
    })).max(3),
  }),
})
```

### Phase 2: Replace Multi-Attempt with Single Call
- Remove `attemptIdentification` function with 3 strategies
- Replace with single `generateObject` call using new schema
- Craft one comprehensive prompt that extracts all needed information

### Phase 3: Strategy-Based Question Flow
- Map strategy types to appropriate follow-up questions
- `check_label`: Guide user to find tags (location hints)
- `purchase_history`: Ask for receipt/email
- `store_search`: Retailer dropdown + price range
- `feature_match`: Search by distinctive features
- `use_estimates`: Skip questions, use visual estimates

### Phase 4: Targeted Research Integration
- Modify Perplexity search to use rich context from answers
- Query format: "{retailer} {item type} {features} {price range}"
- Skip Perplexity entirely for `use_estimates` strategy

### Phase 5: Update Return Types
- Ensure backward compatibility with existing callers
- Return richer clarification objects with input types and options
- Preserve `fullProductName` output format for downstream compatibility

### Files to Modify
- `app/actions/identify-from-photo.ts` - Main refactor
- `app/actions/product-research.ts` - Accept richer context
- Components that call these actions (check for UI updates needed)
<!-- SECTION:PLAN:END -->
