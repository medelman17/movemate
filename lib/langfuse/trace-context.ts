import { AsyncLocalStorage } from "async_hooks";

/**
 * Context for correlating related AI calls within a single operation.
 *
 * When calls cascade (e.g., photo identification → product research → name simplification),
 * this context ensures they share the same trace ID in Langfuse.
 */
export interface TraceContext {
  /** Unique trace ID for this operation */
  traceId: string;
  /** User ID for attribution */
  userId?: string;
  /** Session ID for grouping user sessions */
  sessionId?: string;
  /** Parent span ID for nested spans */
  parentSpanId?: string;
}

const traceContextStorage = new AsyncLocalStorage<TraceContext>();

/**
 * Run a function with trace context propagation.
 *
 * All AI calls made within the callback will share the same trace context,
 * allowing Langfuse to correlate them as part of a single operation.
 *
 * @example
 * ```typescript
 * const result = await runWithTraceContext(
 *   { traceId: generateTraceId(), userId: user.id },
 *   async () => {
 *     const photoResult = await identifyProductFromPhotoV2(imageUrl);
 *     if (photoResult.identified) {
 *       return await researchProduct(photoResult.identified.fullProductName);
 *     }
 *     return photoResult;
 *   }
 * );
 * ```
 */
export function runWithTraceContext<T>(
  context: TraceContext,
  fn: () => Promise<T>
): Promise<T> {
  return traceContextStorage.run(context, fn);
}

/**
 * Get the current trace context, if any.
 *
 * Returns undefined if called outside of runWithTraceContext.
 */
export function getTraceContext(): TraceContext | undefined {
  return traceContextStorage.getStore();
}

/**
 * Generate a unique trace ID for a new operation.
 *
 * Format: trace_{timestamp}_{random}
 */
export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique session ID for a user session.
 *
 * Format: session_{timestamp}_{random}
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
