/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js when the app starts.
 * It initializes OpenTelemetry with Langfuse for AI observability.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerLangfuseInstrumentation } = await import(
      "./lib/langfuse/instrumentation"
    );
    registerLangfuseInstrumentation();
  }
}
