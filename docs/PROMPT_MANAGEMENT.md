# Prompt Management & A/B Testing

This document describes the hybrid prompt management approach used in MoveMate, combining local TypeScript prompts with Langfuse analytics.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Local Prompts (Source of Truth)             │
│                         lib/prompts/                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ strategic.ts │  │ url-based.ts │  │ simplify.ts  │          │
│  │  v2.0.0      │  │  v1.0.0      │  │  v1.0.0      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Sync (manual)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Langfuse (Analytics & Tracking)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Prompt Management          │ Traces                       │  │
│  │ - photo-identification     │ - Linked to prompt version   │  │
│  │ - product-research-url     │ - Performance metrics        │  │
│  │ - product-research-search  │ - User scores                │  │
│  │ - simplify-product-name    │ - Latency, tokens, etc.      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Why Hybrid?

| Feature | Local Prompts | Langfuse-Only |
|---------|--------------|---------------|
| Type Safety | ✅ Full TypeScript | ❌ Strings |
| Version Control | ✅ Git history | ❌ API only |
| Unit Testing | ✅ Jest/Vitest | ❌ N/A |
| Zero Latency | ✅ Bundled | ❌ API call |
| A/B Testing | ⚠️ Need sync | ✅ Built-in |
| Analytics | ⚠️ Need sync | ✅ Built-in |

**Decision:** Keep local prompts for type safety and reliability, sync to Langfuse for analytics.

## Syncing Prompts

### Manual Sync

```bash
# Dry run (preview what would be synced)
npx tsx scripts/sync-prompts-to-langfuse.ts --dry-run

# Sync to staging
npx tsx scripts/sync-prompts-to-langfuse.ts

# Sync to production (adds 'production' label)
npx tsx scripts/sync-prompts-to-langfuse.ts --production
```

### When to Sync

Sync prompts to Langfuse when:
1. Deploying a new prompt version
2. Starting an A/B test
3. Want to correlate traces with specific prompt versions

## A/B Testing Infrastructure

### How It Works

1. **Create variant prompts locally:**
   ```typescript
   // lib/prompts/photo-identification/strategic-v2.1.ts
   export const PROMPT_META: PromptConfig = {
     id: "photo-identification-strategic",
     version: "2.1.0", // New version
     // ...
   };
   ```

2. **Feature flag in code:**
   ```typescript
   const useNewPrompt = process.env.PROMPT_AB_PHOTO_ID === "v2.1";
   const prompt = useNewPrompt
     ? buildStrategicPromptV21(context)
     : buildStrategicPrompt(context);

   const telemetry = {
     // ... other config
     metadata: {
       promptVersion: useNewPrompt ? "2.1.0" : "2.0.0",
       abTestGroup: useNewPrompt ? "treatment" : "control",
     },
   };
   ```

3. **Sync both versions to Langfuse:**
   ```bash
   npx tsx scripts/sync-prompts-to-langfuse.ts --production
   ```

4. **Analyze in Langfuse:**
   - Filter traces by `promptVersion`
   - Compare scores between versions
   - Check latency, token usage, error rates

### Rollout Strategy

```
Week 1: 10% traffic → v2.1 (canary)
        └─ Monitor error rates, latency

Week 2: 50% traffic → v2.1
        └─ Compare user acceptance scores

Week 3: 100% traffic → v2.1 (if metrics positive)
        └─ Deprecate v2.0
```

### Environment Variables for A/B Tests

```bash
# .env.local
PROMPT_AB_PHOTO_ID=v2.0    # control
# PROMPT_AB_PHOTO_ID=v2.1  # treatment

# Vercel: Use preview deployments for A/B variants
```

## Telemetry Integration

Every AI call includes prompt metadata:

```typescript
const telemetry = buildPhotoIdentificationTelemetry({
  hasContext: !!userContext,
  hasAnswers: !!previousAnswers,
  imageType,
});

// Results in trace metadata:
// {
//   promptName: "photo-identification-strategic",
//   promptVersion: "2.0.0",
//   promptModel: "openai/gpt-4o",
//   hasContext: false,
//   hasAnswers: false,
//   imageType: "base64"
// }
```

This allows filtering and grouping in Langfuse by:
- Prompt name (which AI feature)
- Prompt version (for A/B analysis)
- Call context (with/without context, with/without answers)

## User Outcome Scoring

When users submit items, we score the AI identification:

```typescript
await logIdentificationOutcome(traceId, accepted, {
  originalName: aiSuggestion,
  finalName: userSubmittedName,
});
```

Scores in Langfuse:
- `identification_accepted` (boolean): Did user keep AI's name?
- `name_changed` (boolean): Did user modify the name?
- `category_changed` (boolean): Did user change category?

### Analyzing A/B Test Results

1. Open Langfuse dashboard
2. Go to Analytics → Scores
3. Filter by `promptVersion`
4. Compare `identification_accepted` rate between versions

Example analysis:
```
v2.0.0: 68% acceptance rate (n=1,234)
v2.1.0: 74% acceptance rate (n=456)
        ↑ 6% improvement (p < 0.05)
```

## Prompt Registry

All prompts are registered in `lib/prompts/index.ts`:

```typescript
export const promptRegistry = {
  photoIdentification: {
    detailed: DETAILED_META,
    visual: VISUAL_META,
    fallback: FALLBACK_META,
  },
  productResearch: {
    url: URL_META,
    search: SEARCH_META,
  },
  utilities: {
    simplifyName: SIMPLIFY_NAME_META,
  },
};

// Get all versions for tooling
const allPrompts = getAllPromptVersions();
```

## Best Practices

1. **Always bump version** when changing prompt content
2. **Sync before deploying** new prompt versions
3. **Use meaningful changelog** entries for tracking
4. **Monitor scores** after prompt changes
5. **Keep both versions** until A/B test concludes
6. **Document learnings** from prompt experiments
