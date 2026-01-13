"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Test page for verifying Sentry error tracking.
 * Navigate to /test-error to trigger test errors.
 *
 * This page should be removed before production deployment.
 */
export default function TestErrorPage() {
  const [message, setMessage] = useState<string | null>(null);

  const triggerClientError = () => {
    throw new Error("Test client-side error from /test-error page");
  };

  const triggerCapturedError = () => {
    try {
      throw new Error("Test manually captured error");
    } catch (error) {
      Sentry.captureException(error);
      setMessage("Error captured and sent to Sentry!");
    }
  };

  const triggerServerAction = async () => {
    setMessage("Triggering server action error...");
    const response = await fetch("/api/test-error", { method: "POST" });
    const data = await response.json();
    setMessage(data.message || "Server error triggered");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Sentry Error Test Page</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Use these buttons to trigger different types of errors and verify they
        appear in your Sentry dashboard.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={triggerClientError} variant="destructive">
          Trigger Client Error (Unhandled)
        </Button>

        <Button onClick={triggerCapturedError} variant="outline">
          Trigger Captured Error (Manual)
        </Button>

        <Button onClick={triggerServerAction} variant="secondary">
          Trigger Server Error (API Route)
        </Button>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded">
          {message}
        </p>
      )}

      <p className="text-xs text-muted-foreground mt-8">
        Check your Sentry dashboard at{" "}
        <a
          href="https://sentry.io"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          sentry.io
        </a>{" "}
        to see captured errors.
      </p>
    </div>
  );
}
