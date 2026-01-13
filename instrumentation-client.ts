/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the browser runtime.
 * It is automatically loaded by Next.js 15+ for client-side instrumentation.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Capture 20% of transactions in production, 100% in development
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay
  // Capture 10% of all sessions, 100% of sessions with errors
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful debug information
  debug: false,

  // Disable Sentry if DSN is not configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Integrations
  integrations: [
    // Session Replay integration
    Sentry.replayIntegration({
      // Mask all text content by default for privacy
      maskAllText: true,
      // Block all media elements by default
      blockAllMedia: true,
    }),
    // Browser tracing for performance
    Sentry.browserTracingIntegration(),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Don't send network errors that are likely user connectivity issues
    if (error instanceof Error) {
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Load failed")
      ) {
        return null;
      }
    }

    return event;
  },
});

/**
 * Capture client-side navigation transitions for performance monitoring.
 * This hook is called by Next.js App Router on route changes.
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
