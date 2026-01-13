/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for the Edge runtime (Middleware, Edge API routes).
 * It is imported by instrumentation.ts when NEXT_RUNTIME === "edge".
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Capture 20% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Setting this option to true will print useful debug information
  debug: false,

  // Disable Sentry if DSN is not configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment tag
  environment: process.env.NODE_ENV,
});
