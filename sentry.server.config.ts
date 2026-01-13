/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for the Node.js runtime (Server Components, API routes).
 * It is imported by instrumentation.ts when NEXT_RUNTIME === "nodejs".
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Capture 20% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  // Setting this option to true will print useful debug information
  debug: false,

  // Disable Sentry if DSN is not configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Filter out certain errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Don't send expected errors like auth redirects
    if (error instanceof Error) {
      if (error.message.includes("NEXT_REDIRECT")) {
        return null;
      }
    }

    return event;
  },

  // Integrations
  integrations: [
    // Capture console.error as breadcrumbs
    Sentry.captureConsoleIntegration({ levels: ["error", "warn"] }),
  ],
});
