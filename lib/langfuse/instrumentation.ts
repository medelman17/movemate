import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { telemetryLogger } from "@/lib/logger";

let sdk: NodeSDK | null = null;

/**
 * Register Langfuse instrumentation with OpenTelemetry.
 *
 * This sets up:
 * - OpenTelemetry NodeSDK with LangfuseSpanProcessor
 * - Automatic span capture for all AI calls using Vercel AI SDK telemetry
 * - Async, non-blocking export to Langfuse Cloud
 *
 * @see https://langfuse.com/docs/integrations/vercel-ai-sdk
 */
export function registerLangfuseInstrumentation() {
  if (process.env.LANGFUSE_ENABLED !== "true") {
    telemetryLogger.debug("Tracing disabled (LANGFUSE_ENABLED !== 'true')");
    return;
  }

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_BASEURL || "https://cloud.langfuse.com";

  if (!publicKey || !secretKey) {
    telemetryLogger.error("Missing LANGFUSE_PUBLIC_KEY or LANGFUSE_SECRET_KEY");
    return;
  }

  // LangfuseSpanProcessor v4 accepts config directly
  const langfuseSpanProcessor = new LangfuseSpanProcessor({
    publicKey,
    secretKey,
    baseUrl,
    // Use immediate export for serverless/edge compatibility
    exportMode: "immediate",
  });

  sdk = new NodeSDK({
    spanProcessors: [langfuseSpanProcessor],
    instrumentations: [new PinoInstrumentation()],
  });

  sdk.start();
  telemetryLogger.info("OpenTelemetry instrumentation started");

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await sdk?.shutdown();
      telemetryLogger.info("OpenTelemetry SDK shut down gracefully");
    } catch (error) {
      telemetryLogger.error({ error }, "Error during shutdown");
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

/**
 * Check if Langfuse instrumentation is enabled and properly configured.
 */
export function isLangfuseEnabled(): boolean {
  return (
    process.env.LANGFUSE_ENABLED === "true" &&
    !!process.env.LANGFUSE_PUBLIC_KEY &&
    !!process.env.LANGFUSE_SECRET_KEY
  );
}
