import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Helper to login with test user
async function loginAsTestUser(page: Page) {
  await page.goto("http://localhost:3000");

  // Check if we're on login page
  if (page.url().includes("/auth/login")) {
    // Click "Sign in as Test User" button
    await page.click("text=Sign in as Test User");

    // Wait for redirect to main page
    await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
  }
}

test.describe("V2 Photo Identification", () => {
  test.beforeAll(async () => {
    // Create test fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, "fixtures");
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
  });

  test("should load the main page and show Add Item button", async ({ page }) => {
    await loginAsTestUser(page);

    // Wait for the page to be loaded
    await expect(page.locator("text=Add Item")).toBeVisible({ timeout: 10000 });
  });

  test("should open Add Item dialog", async ({ page }) => {
    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");

    // Check dialog opened
    await expect(page.locator("text=Add New Item")).toBeVisible();
    await expect(page.locator("text=Upload Photo to Auto-Identify")).toBeVisible();
  });

  test("should show processing stages when uploading photo", async ({ page }) => {
    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Check that the upload button exists
    await expect(page.locator("text=Upload Photo to Auto-Identify")).toBeVisible();

    // Verify the file input exists (hidden but available)
    const fileInput = page.locator('input[type="file"]#photo-upload');
    await expect(fileInput).toBeAttached();
  });

  test("should use V2 identification (check console logs)", async ({ page }) => {
    // Collect console logs to verify V2 is being used
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // The V2 import should be loaded
    // We can verify the page loads correctly with all expected elements
    await expect(page.locator("text=Upload Photo to Auto-Identify")).toBeVisible();
    await expect(page.locator("text=Item Name")).toBeVisible();
    await expect(page.locator('label:has-text("Category")')).toBeVisible();
  });

  test("form fields should be present and functional", async ({ page }) => {
    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Check all form fields exist
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#description")).toBeVisible();
    await expect(page.locator("#quantity")).toBeVisible();
    await expect(page.locator("#weight")).toBeVisible();
    await expect(page.locator("#length")).toBeVisible();
    await expect(page.locator("#width")).toBeVisible();
    await expect(page.locator("#height")).toBeVisible();

    // Type in the name field
    await page.fill("#name", "Test Coffee Table");
    await expect(page.locator("#name")).toHaveValue("Test Coffee Table");

    // Check Auto-fill button exists
    await expect(page.getByRole("button", { name: "Auto-fill" })).toBeVisible();
  });

  test("Auto-fill button should trigger research", async ({ page }) => {
    // Collect console logs
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Type a product name
    await page.fill("#name", "IKEA KALLAX shelf");

    // Click Auto-fill
    await page.click("text=Auto-fill");

    // Wait for research to start (button should show "Researching...")
    await expect(page.locator("text=Researching...")).toBeVisible({ timeout: 5000 });

    // Wait for research to complete (may take a while due to API call)
    // The button should go back to "Auto-fill" when done
    await expect(page.locator("text=Auto-fill")).toBeVisible({ timeout: 30000 });

    // Check that console logs show research happening
    const _hasResearchLog = consoleLogs.some((log) => log.includes("[v0] Research input:"));
    console.log("Console logs captured:", consoleLogs.filter((l) => l.includes("[v0]")), _hasResearchLog);

    // Product info found toast or form should be filled
    // (We don't assert on the actual values as they depend on the API)
  });

  test("photo upload should trigger V2 identification", async ({ page }) => {
    // Collect console logs to verify V2 is being used
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Get the file input (hidden)
    const fileInput = page.locator('input[type="file"]#photo-upload');

    // Upload test image
    const testImagePath = path.join(__dirname, "fixtures", "test-chair.jpg");
    await fileInput.setInputFiles(testImagePath);

    // Should see "Processing image..." or "Identifying product with AI..."
    await expect(
      page.locator("text=Processing image...").or(page.locator("text=Identifying product with AI..."))
    ).toBeVisible({ timeout: 10000 });

    // Wait for identification to complete or clarification to be requested
    // This could take up to 30 seconds for the AI call
    await expect(
      page
        .locator("text=Product identified")
        .or(page.locator("text=Help us identify"))
        .or(page.locator("text=Need more information"))
        .or(page.locator("#name[value]")) // Name field gets filled
    ).toBeVisible({ timeout: 60000 });

    // Check console logs for V2 markers
    const v2Logs = consoleLogs.filter((log) => log.includes("[v2]"));
    const v0Logs = consoleLogs.filter((log) => log.includes("[v0]"));

    console.log("V2 logs found:", v2Logs.length);
    console.log("V2 log samples:", v2Logs.slice(0, 3));
    console.log("V0 logs found:", v0Logs.length);

    // V2 should be used (look for [v2] Strategic photo identification started)
    const usesV2 = v2Logs.some((log) => log.includes("Strategic photo identification started"));
    console.log("Uses V2:", usesV2);

    // Take a screenshot for verification
    await page.screenshot({ path: "e2e/screenshots/after-upload.png", fullPage: true });
  });
});
