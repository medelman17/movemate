import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug");

/**
 * Base Pino logger configured for the environment.
 *
 * - Production: JSON output for log aggregators (Vercel, etc.)
 * - Development: Pretty-printed output with colors
 *
 * When OpenTelemetry instrumentation is enabled, logs automatically
 * include trace_id and span_id for correlation with Langfuse traces.
 */
export const logger = pino({
  level: logLevel,
  ...(isProduction
    ? {
        formatters: {
          level: (label) => ({ level: label }),
        },
      }
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      }),
});

/**
 * Child logger for AI/ML operations (photo identification, product research).
 * Use for all generateObject calls and AI-related processing.
 */
export const aiLogger = logger.child({ module: "ai" });

/**
 * Child logger for authentication operations.
 * Use for login, logout, session management.
 */
export const authLogger = logger.child({ module: "auth" });

/**
 * Child logger for database operations.
 * Use for CRUD operations on items, categories, locations.
 */
export const dbLogger = logger.child({ module: "db" });

/**
 * Child logger for telemetry/observability operations.
 * Use for Langfuse, OpenTelemetry, and instrumentation.
 */
export const telemetryLogger = logger.child({ module: "telemetry" });
