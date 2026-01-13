import { NextResponse } from "next/server";

/**
 * Test API route for verifying Sentry server-side error tracking.
 * POST /api/test-error triggers an error that should appear in Sentry.
 *
 * This route should be removed before production deployment.
 */
export async function POST() {
  // Simulate some processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Throw an error that Sentry should capture
  throw new Error("Test server-side error from /api/test-error route");
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger a test error",
  });
}
