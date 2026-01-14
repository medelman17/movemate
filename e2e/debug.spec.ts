import { test } from "@playwright/test";

test("debug: what's on the page?", async ({ page }) => {
  await page.goto("http://localhost:3000");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  // Take a screenshot
  await page.screenshot({ path: "e2e/screenshots/page-state.png", fullPage: true });

  // Log page info
  console.log("Page title:", await page.title());
  console.log("Page URL:", page.url());

  // Log some text content
  const bodyText = await page.locator("body").textContent();
  console.log("Body text (first 500 chars):", bodyText?.slice(0, 500));
});
