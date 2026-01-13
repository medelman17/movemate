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
  generateTraceId,
  type TelemetryContext,
} from "./telemetry";
