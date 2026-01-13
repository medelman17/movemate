import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["pino", "pino-pretty"],
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project slugs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress noisy build logs in non-CI environments
  silent: !process.env.CI,

  // Upload source maps for better error stack traces
  // Requires SENTRY_AUTH_TOKEN environment variable
  sourcemaps: {
    // Delete source maps after upload for security
    deleteSourcemapsAfterUpload: true,
  },

  // Use the new Next.js 15.4+ hook for Turbopack compatibility
  runAfterProductionCompile: true,
});
