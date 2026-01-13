"use server";

import { LangfuseClient } from "@langfuse/client";

/**
 * Corrections made by the user to the AI identification.
 */
export interface IdentificationCorrections {
  /** Original name suggested by AI */
  originalName: string;
  /** Name submitted by user */
  finalName: string;
  /** Whether category was changed */
  categoryChanged?: boolean;
  /** Whether dimensions were changed */
  dimensionsChanged?: boolean;
}

// Lazy-initialize the client to avoid issues during build
let langfuseClient: LangfuseClient | null = null;

function getLangfuseClient(): LangfuseClient | null {
  if (process.env.LANGFUSE_ENABLED !== "true") {
    return null;
  }

  if (!langfuseClient) {
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;

    if (!publicKey || !secretKey) {
      console.warn("[Langfuse] Missing API keys, scoring disabled");
      return null;
    }

    langfuseClient = new LangfuseClient({
      publicKey,
      secretKey,
      baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
    });
  }

  return langfuseClient;
}

/**
 * Log the outcome of an identification to Langfuse for analytics.
 *
 * This should be called when the user submits the form, comparing
 * the AI suggestion to what the user actually submitted.
 *
 * @param traceId - The Langfuse trace ID from the identification call
 * @param accepted - Whether the user accepted the AI suggestion without changes
 * @param corrections - Optional details about what was changed
 *
 * @example
 * ```typescript
 * // User accepted AI suggestion
 * await logIdentificationOutcome(traceId, true);
 *
 * // User modified the name
 * await logIdentificationOutcome(traceId, false, {
 *   originalName: "IKEA KALLAX Shelf",
 *   finalName: "Bookshelf",
 * });
 * ```
 */
export async function logIdentificationOutcome(
  traceId: string | undefined,
  accepted: boolean,
  corrections?: IdentificationCorrections
): Promise<void> {
  // Skip if no traceId (tracing was disabled during identification)
  if (!traceId) {
    console.log("[Langfuse] No traceId provided, skipping score");
    return;
  }

  const client = getLangfuseClient();
  if (!client) {
    console.log("[Langfuse] Client not available, skipping score");
    return;
  }

  try {
    // Primary score: was the identification accepted?
    client.score.create({
      traceId,
      name: "identification_accepted",
      value: accepted ? 1 : 0,
      dataType: "BOOLEAN",
      comment: accepted
        ? "User accepted AI identification"
        : `User corrected: "${corrections?.originalName}" → "${corrections?.finalName}"`,
    });

    // If corrected, log additional context
    if (!accepted && corrections) {
      // Log the magnitude of the correction
      const nameChanged = corrections.originalName !== corrections.finalName;

      client.score.create({
        traceId,
        name: "name_changed",
        value: nameChanged ? 1 : 0,
        dataType: "BOOLEAN",
        comment: nameChanged
          ? `Changed from "${corrections.originalName}" to "${corrections.finalName}"`
          : "Name unchanged",
      });

      if (corrections.categoryChanged) {
        client.score.create({
          traceId,
          name: "category_changed",
          value: 1,
          dataType: "BOOLEAN",
        });
      }

      if (corrections.dimensionsChanged) {
        client.score.create({
          traceId,
          name: "dimensions_changed",
          value: 1,
          dataType: "BOOLEAN",
        });
      }
    }

    // Flush to ensure scores are sent
    await client.flush();

    console.log("[Langfuse] Score logged successfully", {
      traceId,
      accepted,
      hasCorrections: !!corrections,
    });
  } catch (error) {
    // Log but don't throw - scoring should never break the user flow
    console.error("[Langfuse] Failed to log score:", error);
  }
}
