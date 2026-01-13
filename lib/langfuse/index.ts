/**
 * Langfuse Integration
 *
 * This module provides OpenTelemetry-based observability for AI calls.
 *
 * @see docs/LANGFUSE_INTEGRATION_PLAN.md for full documentation
 */

export {
  registerLangfuseInstrumentation,
  isLangfuseEnabled,
} from "./instrumentation";

export {
  buildTelemetry,
  buildPhotoIdentificationTelemetry,
  buildProductResearchTelemetry,
  buildSimplifyNameTelemetry,
  type TelemetryContext,
} from "./telemetry";

export {
  runWithTraceContext,
  getTraceContext,
  generateTraceId,
  generateSessionId,
  type TraceContext,
} from "./trace-context";

export {
  logIdentificationOutcome,
  type IdentificationCorrections,
} from "./scoring";
