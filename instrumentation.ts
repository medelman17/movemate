/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js when the app starts.
 * It initializes:
 * - Sentry for error monitoring and performance tracking
 * - OpenTelemetry with Langfuse for AI observability
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize Sentry for Node.js runtime
    await import("./sentry.server.config");

    // Initialize Langfuse/OpenTelemetry for AI observability
    const { registerLangfuseInstrumentation } = await import(
      "./lib/langfuse/instrumentation"
    );
    registerLangfuseInstrumentation();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Initialize Sentry for Edge runtime
    await import("./sentry.edge.config");
  }
}

/**
 * Capture errors from React Server Components.
 *
 * This hook is called by Next.js when an error occurs during request handling,
 * including errors in Server Components, Server Actions, and Route Handlers.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional
 */
export const onRequestError = Sentry.captureRequestError;
