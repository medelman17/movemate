# Langfuse Integration Plan for MoveMate

## Executive Summary

This document outlines a comprehensive plan to integrate [Langfuse](https://langfuse.com) into MoveMate for LLM observability, tracing, and analytics. The integration leverages OpenTelemetry (via the Vercel AI SDK's built-in telemetry) and Langfuse's v4 SDK.

**Key Benefits:**
- Full visibility into AI call performance, costs, and errors
- Prompt versioning and effectiveness tracking
- User-facing outcome correlation
- Token usage and cost analytics
- Strategy effectiveness analysis (for photo identification)

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Architecture Overview](#2-architecture-overview)
3. [Implementation Phases](#3-implementation-phases)
4. [Package Dependencies](#4-package-dependencies)
5. [Configuration](#5-configuration)
6. [Code Changes](#6-code-changes)
7. [Observability Metrics](#7-observability-metrics)
8. [Testing Strategy](#8-testing-strategy)
9. [Migration & Rollout](#9-migration--rollout)
10. [Cost Considerations](#10-cost-considerations)

---

## 1. Current State Analysis

### Existing AI Infrastructure

| Component | Description |
|-----------|-------------|
| **AI Gateway** | Vercel AI Gateway with `AI_GATEWAY_API_KEY` |
| **SDK** | Vercel AI SDK v6.0.27 (`ai` package) |
| **Models** | GPT-4o (vision), GPT-4o-mini (fast), Perplexity sonar-pro (research) |
| **Pattern** | `generateObject` (structured) + `generateText` (unstructured) |

### Server Actions Making AI Calls

| File | Function | Model | Pattern |
|------|----------|-------|---------|
| `app/actions/identify-from-photo-v2.ts` | `identifyProductFromPhotoV2` | GPT-4o | `generateObject` |
| `app/actions/product-research.ts` | `researchProduct` | Perplexity sonar-pro | `generateText` |
| `app/actions/simplify-product-name.ts` | `simplifyProductName` | GPT-4o-mini | `generateText` |

### Current Logging

- Console.log with prefixes (`[v2]`, `[v0]`)
- Duration tracking (manual `Date.now()`)
- No structured observability
- No token/cost tracking

### Prompt Management System

The existing prompt system in `lib/prompts/` provides:
- `PromptConfig` with id, version, model, maxTokens, changelog
- `PromptBuilder<TContext>` functions
- Central `promptRegistry` for tooling access
- Shared fragments for composition

This is **excellent** for Langfuse integration as we can map prompt metadata directly.

---

## 2. Architecture Overview

### Integration Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│  Server Actions (identify-from-photo, product-research, etc.)       │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              lib/langfuse/instrumentation.ts                  │  │
│  │  - OpenTelemetry NodeSDK setup                                │  │
│  │  - LangfuseSpanProcessor                                      │  │
│  │  - Trace context propagation                                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Vercel AI SDK (with telemetry: true)             │  │
│  │  - generateObject / generateText                              │  │
│  │  - Built-in OpenTelemetry spans                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Vercel AI Gateway                          │  │
│  │  - Routing to OpenAI, Perplexity, etc.                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Langfuse Cloud                              │
│  - Traces & Spans                                                   │
│  - Token/Cost Analytics                                             │
│  - Prompt Management & Versioning                                   │
│  - Evaluations & Scores                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request arrives** → Server action invoked
2. **Trace context created** → User ID, session ID, metadata attached
3. **AI call made** → Vercel AI SDK emits OpenTelemetry spans
4. **LangfuseSpanProcessor** → Captures spans, enriches with metadata
5. **Sent to Langfuse** → Async, non-blocking export
6. **Response returned** → User sees result, trace completes

---

## 3. Implementation Phases

### Phase 1: Core Infrastructure (Foundation)

**Goal:** Set up OpenTelemetry + Langfuse SDK, enable basic tracing

**Tasks:**
- [ ] Install required packages
- [ ] Create `lib/langfuse/instrumentation.ts` with OpenTelemetry setup
- [ ] Create `instrumentation.ts` in project root (Next.js instrumentation hook)
- [ ] Add environment variables for Langfuse
- [ ] Enable telemetry in one server action as proof-of-concept
- [ ] Verify traces appear in Langfuse dashboard

**Estimated Effort:** 2-4 hours

### Phase 2: Full Telemetry Coverage

**Goal:** Instrument all AI calls with proper metadata

**Tasks:**
- [ ] Add `experimental_telemetry` to all `generateObject`/`generateText` calls
- [ ] Create helper functions for consistent telemetry configuration
- [ ] Map `PromptConfig` metadata to Langfuse attributes
- [ ] Add user/session context to traces
- [ ] Implement trace correlation for cascading calls (photo → research → simplify)

**Estimated Effort:** 3-5 hours

### Phase 3: Enhanced Observability

**Goal:** Rich analytics and business metrics

**Tasks:**
- [ ] Track strategy effectiveness (which photo identification strategies succeed)
- [ ] Log clarification question → answer → outcome correlation
- [ ] Add custom scores for result quality
- [ ] Create Langfuse datasets for evaluation
- [ ] Set up alerts for error rates and latency

**Estimated Effort:** 4-6 hours

### Phase 4: Prompt Management Integration

**Goal:** Sync prompt versions with Langfuse

**Tasks:**
- [ ] Evaluate Langfuse Prompt Management vs. local `lib/prompts/`
- [ ] Create script to export prompt versions to Langfuse
- [ ] Add prompt deployment tracking
- [ ] A/B testing infrastructure for prompt variants

**Estimated Effort:** 3-4 hours

---

## 4. Package Dependencies

### Required New Packages

```bash
pnpm add @langfuse/tracing @langfuse/otel @opentelemetry/sdk-node @opentelemetry/api
```

| Package | Purpose |
|---------|---------|
| `@langfuse/tracing` | Langfuse v4 TypeScript SDK |
| `@langfuse/otel` | LangfuseSpanProcessor for OpenTelemetry |
| `@opentelemetry/sdk-node` | OpenTelemetry Node.js SDK |
| `@opentelemetry/api` | OpenTelemetry API types |

### Version Compatibility

```json
{
  "ai": "^6.0.0",         // Current: 6.0.27 ✓ (telemetry support in v3.3.0+)
  "@langfuse/tracing": "^4.0.0",
  "@langfuse/otel": "^4.0.0",
  "@opentelemetry/sdk-node": "^0.57.0",
  "@opentelemetry/api": "^1.9.0"
}
```

---

## 5. Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASEURL=https://cloud.langfuse.com  # or self-hosted URL

# Optional: Enable/disable tracing
LANGFUSE_ENABLED=true
```

### Next.js Configuration

Update `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,  // Enable instrumentation.ts
  },
  // ... existing config
};
```

---

## 6. Code Changes

### 6.1 Instrumentation Setup

**File: `instrumentation.ts` (project root)**

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerLangfuseInstrumentation } = await import('./lib/langfuse/instrumentation');
    registerLangfuseInstrumentation();
  }
}
```

**File: `lib/langfuse/instrumentation.ts`**

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import { Langfuse } from '@langfuse/tracing';

let sdk: NodeSDK | null = null;

export function registerLangfuseInstrumentation() {
  if (process.env.LANGFUSE_ENABLED !== 'true') {
    console.log('[Langfuse] Tracing disabled');
    return;
  }

  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    secretKey: process.env.LANGFUSE_SECRET_KEY!,
    baseUrl: process.env.LANGFUSE_BASEURL,
  });

  const langfuseSpanProcessor = new LangfuseSpanProcessor({ langfuse });

  sdk = new NodeSDK({
    spanProcessors: [langfuseSpanProcessor],
  });

  sdk.start();
  console.log('[Langfuse] OpenTelemetry instrumentation started');

  // Graceful shutdown
  process.on('SIGTERM', () => {
    sdk?.shutdown().catch(console.error);
  });
}
```

### 6.2 Telemetry Helper Functions

**File: `lib/langfuse/telemetry.ts`**

```typescript
import type { PromptConfig } from '@/lib/prompts/types';

/**
 * Build telemetry configuration for Vercel AI SDK calls.
 * Maps our PromptConfig metadata to Langfuse-compatible attributes.
 */
export interface TelemetryContext {
  /** Prompt configuration from lib/prompts */
  promptConfig: PromptConfig;
  /** User ID for tracking (optional) */
  userId?: string;
  /** Session ID for grouping related traces */
  sessionId?: string;
  /** Additional custom metadata */
  metadata?: Record<string, string | number | boolean>;
}

export function buildTelemetry(context: TelemetryContext) {
  const { promptConfig, userId, sessionId, metadata } = context;

  return {
    isEnabled: process.env.LANGFUSE_ENABLED === 'true',
    functionId: promptConfig.id,
    metadata: {
      // Prompt metadata
      promptVersion: promptConfig.version,
      promptModel: promptConfig.model,
      promptMaxTokens: promptConfig.maxTokens,

      // User context
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),

      // Custom metadata
      ...metadata,
    },
  };
}

/**
 * Generate a unique trace ID for correlating cascading calls.
 */
export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Build telemetry for photo identification calls.
 */
export function buildPhotoIdentificationTelemetry(options: {
  userId?: string;
  sessionId?: string;
  hasContext: boolean;
  hasAnswers: boolean;
  imageType: 'base64' | 'url';
}) {
  return {
    isEnabled: process.env.LANGFUSE_ENABLED === 'true',
    functionId: 'photo-identification-strategic',
    metadata: {
      promptVersion: '2.0.0',
      promptModel: 'openai/gpt-4o',
      hasContext: options.hasContext,
      hasAnswers: options.hasAnswers,
      imageType: options.imageType,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}

/**
 * Build telemetry for product research calls.
 */
export function buildProductResearchTelemetry(options: {
  userId?: string;
  sessionId?: string;
  isUrl: boolean;
  hasPhotoContext: boolean;
}) {
  return {
    isEnabled: process.env.LANGFUSE_ENABLED === 'true',
    functionId: 'product-research',
    metadata: {
      promptModel: 'perplexity/sonar-pro',
      isUrl: options.isUrl,
      hasPhotoContext: options.hasPhotoContext,
      ...(options.userId && { userId: options.userId }),
      ...(options.sessionId && { sessionId: options.sessionId }),
    },
  };
}
```

### 6.3 Server Action Updates

**File: `app/actions/identify-from-photo-v2.ts` (updated)**

```typescript
"use server";

import { generateObject, createGateway } from "ai";
import {
  buildStrategicPrompt,
  strategicIdentificationSchema,
  type StrategicIdentification,
  type ClarificationQuestion,
} from "@/lib/prompts/photo-identification";
import { buildPhotoIdentificationTelemetry } from "@/lib/langfuse/telemetry";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export async function identifyProductFromPhotoV2(
  imageUrl: string,
  userContext?: string,
  previousAnswers?: Record<string, string>,
  options?: { userId?: string; sessionId?: string }
): Promise<StrategicIdentificationResult> {
  const startTime = Date.now();

  // ... validation ...

  try {
    const imageType = imageUrl.startsWith("data:") ? "base64" : "url";

    console.log("[v2] Strategic photo identification started", {
      hasContext: !!userContext,
      hasAnswers: !!previousAnswers,
      imageType,
    });

    const promptText = buildStrategicPrompt({ userContext, previousAnswers });

    // Build telemetry configuration
    const telemetry = buildPhotoIdentificationTelemetry({
      userId: options?.userId,
      sessionId: options?.sessionId,
      hasContext: !!userContext,
      hasAnswers: !!previousAnswers,
      imageType,
    });

    const { object } = await generateObject({
      model: gateway("openai/gpt-4o"),
      schema: strategicIdentificationSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image", image: imageUrl },
          ],
        },
      ],
      maxOutputTokens: 800,
      temperature: 0.3,
      experimental_telemetry: telemetry,  // <-- ADD THIS
    });

    const duration = Date.now() - startTime;
    const result = object as StrategicIdentification;

    console.log(`[v2] Analysis complete in ${duration}ms`, {
      itemType: result.itemType,
      strategy: result.strategy.approach,
      hasImmediateId: !!result.immediateIdentification,
      questionCount: result.strategy.questions.length,
      confidence: result.strategy.confidence,
    });

    // ... rest of function ...
  } catch (error) {
    // ... error handling ...
  }
}
```

### 6.4 Trace Correlation for Cascading Calls

When calls cascade (e.g., photo identification → product research → name simplification), we need to correlate them:

**File: `lib/langfuse/trace-context.ts`**

```typescript
import { AsyncLocalStorage } from 'async_hooks';

interface TraceContext {
  traceId: string;
  sessionId?: string;
  userId?: string;
  parentSpanId?: string;
}

const traceContextStorage = new AsyncLocalStorage<TraceContext>();

export function runWithTraceContext<T>(
  context: TraceContext,
  fn: () => Promise<T>
): Promise<T> {
  return traceContextStorage.run(context, fn);
}

export function getTraceContext(): TraceContext | undefined {
  return traceContextStorage.getStore();
}

export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
```

**Usage in component:**

```typescript
// In a component or API route that orchestrates multiple AI calls
import { runWithTraceContext, generateTraceId } from '@/lib/langfuse/trace-context';

async function handlePhotoUpload(imageUrl: string, userId: string) {
  const traceId = generateTraceId();

  return runWithTraceContext({ traceId, userId }, async () => {
    // All AI calls within this context share the same traceId
    const photoResult = await identifyProductFromPhotoV2(imageUrl, undefined, undefined, { userId });

    if (photoResult.identified) {
      const researchResult = await researchProduct(photoResult.identified.fullProductName, {
        features: photoResult.features,
        category: photoResult.estimates.category,
      });
      return researchResult;
    }

    return photoResult;
  });
}
```

---

## 7. Observability Metrics

### Core Metrics to Track

| Metric | Source | Purpose |
|--------|--------|---------|
| **Latency (p50, p95, p99)** | OpenTelemetry spans | Performance monitoring |
| **Token Usage (input/output)** | Vercel AI SDK telemetry | Cost tracking |
| **Error Rate** | Span status | Reliability monitoring |
| **Strategy Distribution** | Custom metadata | Photo ID analysis |
| **Confidence Scores** | Custom metadata | Quality tracking |
| **Clarification Rate** | Custom metric | UX optimization |

### Custom Scores

Langfuse supports custom scores for evaluation:

```typescript
import { Langfuse } from '@langfuse/tracing';

const langfuse = new Langfuse({ ... });

// After a successful identification
langfuse.score({
  traceId: traceContext.traceId,
  name: 'identification_success',
  value: 1,
  comment: 'User accepted the identification',
});

// After user corrects an identification
langfuse.score({
  traceId: traceContext.traceId,
  name: 'identification_success',
  value: 0,
  comment: 'User manually corrected the item name',
});
```

### Dashboards to Create

1. **Overview Dashboard**
   - Total AI calls per day
   - Average latency by model
   - Total token usage and estimated cost
   - Error rate trends

2. **Photo Identification Dashboard**
   - Strategy distribution (pie chart)
   - Immediate identification rate
   - Clarification question effectiveness
   - Confidence score distribution

3. **Cost Analytics Dashboard**
   - Cost by model (GPT-4o vs GPT-4o-mini vs Perplexity)
   - Cost per user session
   - Token efficiency (output/input ratio)

---

## 8. Testing Strategy

### Unit Tests

**File: `lib/langfuse/__tests__/telemetry.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { buildPhotoIdentificationTelemetry, buildTelemetry } from '../telemetry';

describe('buildPhotoIdentificationTelemetry', () => {
  it('should include all required metadata', () => {
    const telemetry = buildPhotoIdentificationTelemetry({
      hasContext: true,
      hasAnswers: false,
      imageType: 'base64',
    });

    expect(telemetry.functionId).toBe('photo-identification-strategic');
    expect(telemetry.metadata.hasContext).toBe(true);
    expect(telemetry.metadata.imageType).toBe('base64');
  });

  it('should conditionally include userId when provided', () => {
    const withUser = buildPhotoIdentificationTelemetry({
      userId: 'user_123',
      hasContext: false,
      hasAnswers: false,
      imageType: 'url',
    });

    expect(withUser.metadata.userId).toBe('user_123');
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Langfuse Integration', () => {
  it('should send spans to Langfuse when enabled', async () => {
    process.env.LANGFUSE_ENABLED = 'true';

    // Mock the Langfuse client
    const mockSpanProcessor = vi.fn();

    // Make an AI call and verify span was processed
    // ...
  });

  it('should not send spans when disabled', async () => {
    process.env.LANGFUSE_ENABLED = 'false';

    // Verify no spans are sent
    // ...
  });
});
```

### Manual Testing Checklist

- [ ] Verify traces appear in Langfuse dashboard
- [ ] Confirm token counts match expectations
- [ ] Check that errors are properly captured
- [ ] Validate metadata is searchable in Langfuse
- [ ] Test graceful degradation when Langfuse is unavailable

---

## 9. Migration & Rollout

### Rollout Strategy

**Week 1: Development Environment**
1. Install packages
2. Set up instrumentation
3. Enable for one action (photo identification)
4. Verify traces in Langfuse

**Week 2: Staging/Preview**
1. Enable for all AI calls
2. Set up dashboards
3. Test under load
4. Document any issues

**Week 3: Production**
1. Deploy with `LANGFUSE_ENABLED=true`
2. Monitor for performance impact
3. Set up alerts
4. Team training on Langfuse UI

### Rollback Plan

If issues arise:
1. Set `LANGFUSE_ENABLED=false` in environment
2. Redeploy (no code changes needed)
3. Investigate issues in Langfuse (historical data preserved)

### Feature Flag Integration

For gradual rollout:

```typescript
// lib/langfuse/config.ts
export function isLangfuseEnabled(userId?: string): boolean {
  // Check environment
  if (process.env.LANGFUSE_ENABLED !== 'true') return false;

  // Optional: percentage rollout
  if (userId) {
    const percentage = parseInt(process.env.LANGFUSE_ROLLOUT_PERCENTAGE || '100');
    const hash = simpleHash(userId);
    return hash % 100 < percentage;
  }

  return true;
}
```

---

## 10. Cost Considerations

### Langfuse Pricing

| Plan | Traces/Month | Cost |
|------|--------------|------|
| Free | 50,000 | $0 |
| Pro | 1,000,000 | $59/month |
| Team | Unlimited | Custom |

### Estimated Usage

Based on current traffic patterns:

| Action | Est. Daily Calls | Monthly |
|--------|------------------|---------|
| Photo ID | 100-500 | 3,000-15,000 |
| Product Research | 50-200 | 1,500-6,000 |
| Name Simplification | 50-200 | 1,500-6,000 |
| **Total** | | **6,000-27,000** |

**Recommendation:** Start with the Free tier (50,000 traces/month), which should cover initial usage with room for growth.

### Performance Overhead

- **Latency Impact:** <5ms per call (async export)
- **Memory:** ~10MB for OpenTelemetry SDK
- **Network:** Minimal (batched async exports)

The integration is designed to be non-blocking. If Langfuse is unavailable, AI calls still complete normally.

---

## Appendix A: File Structure

```
├── instrumentation.ts                    # Next.js instrumentation hook
├── lib/
│   └── langfuse/
│       ├── instrumentation.ts            # OpenTelemetry + Langfuse setup
│       ├── telemetry.ts                  # Telemetry helper functions
│       ├── trace-context.ts              # Async context for trace correlation
│       ├── config.ts                     # Feature flags, settings
│       └── __tests__/
│           └── telemetry.test.ts         # Unit tests
├── app/
│   └── actions/
│       ├── identify-from-photo-v2.ts     # Updated with telemetry
│       ├── product-research.ts           # Updated with telemetry
│       └── simplify-product-name.ts      # Updated with telemetry
```

---

## Appendix B: Quick Start Commands

```bash
# 1. Install dependencies
pnpm add @langfuse/tracing @langfuse/otel @opentelemetry/sdk-node @opentelemetry/api

# 2. Set environment variables
echo "LANGFUSE_PUBLIC_KEY=pk-lf-..." >> .env.local
echo "LANGFUSE_SECRET_KEY=sk-lf-..." >> .env.local
echo "LANGFUSE_BASEURL=https://cloud.langfuse.com" >> .env.local
echo "LANGFUSE_ENABLED=true" >> .env.local

# 3. Run development server
pnpm dev

# 4. Test an AI call and check Langfuse dashboard
```

---

## Appendix C: Related Resources

- [Langfuse Documentation](https://langfuse.com/docs)
- [Vercel AI SDK Telemetry](https://ai-sdk.dev/providers/observability/langfuse)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/languages/js/)
- [Langfuse TypeScript SDK v4](https://langfuse.com/docs/sdk/typescript)

---

## Appendix D: Decision Log

| Decision | Rationale |
|----------|-----------|
| Use OpenTelemetry integration | Langfuse v4 uses OTEL; deprecated `langfuse-vercel` package |
| Keep local prompt management | `lib/prompts/` is well-structured; Langfuse prompts can be explored later |
| AsyncLocalStorage for trace correlation | Standard Node.js pattern for request context propagation |
| Feature flag for enable/disable | Zero-risk rollout and instant rollback capability |

---

*Plan created: January 2026*
*Author: Claude (AI Assistant)*
*Status: Ready for Review*
