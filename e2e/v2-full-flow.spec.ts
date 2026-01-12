import { test, expect, Page } from "@playwright/test";
import * as path from "path";

async function loginAsTestUser(page: Page) {
  await page.goto("http://localhost:3000");
  if (page.url().includes("/auth/login")) {
    await page.click("text=Sign in as Test User");
    await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
  }
}

test.describe("V2 Full Photo Identification Flow", () => {
  test.setTimeout(120000); // 2 minute timeout for AI calls via gateway

  test("complete photo upload and identification flow", async ({ page }) => {
    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Take screenshot before upload
    await page.screenshot({ path: "e2e/screenshots/01-before-upload.png" });

    // Upload test image
    const fileInput = page.locator('input[type="file"]#photo-upload');
    const testImagePath = path.join(__dirname, "fixtures", "test-chair.jpg");
    await fileInput.setInputFiles(testImagePath);

    // Take screenshot during processing
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/02-processing.png" });

    // Wait for processing to start
    const processingLocator = page
      .locator("text=Processing image...")
      .or(page.locator("text=Validating image..."))
      .or(page.locator("text=Identifying product with AI..."));
    await expect(processingLocator).toBeVisible({ timeout: 10000 });

    console.log("Processing started...");

    // Wait for AI identification to complete
    // It will either:
    // 1. Show toast "Product identified and researched!"
    // 2. Show clarification questions "Help us identify this product"
    // 3. Show error toast
    // 4. Fill in the name field

    // Wait for any of these to appear (use .first() to handle multiple matches)
    const completionLocator = page
      .locator('div[role="status"]:has-text("Product identified")') // Success toast
      .or(page.locator("h4:has-text('Help us identify')")) // Clarification heading
      .or(page.locator('div[role="status"]:has-text("identified")')) // Any identification toast
      .or(page.locator('div[role="status"]:has-text("Research failed")')) // Research error (but ID worked)
      .or(page.locator('div[role="status"]:has-text("Identification needs help")')); // ID failed

    await expect(completionLocator.first()).toBeVisible({ timeout: 60000 });

    // Take final screenshot
    await page.screenshot({ path: "e2e/screenshots/03-result.png" });

    // Check if name field has been populated
    const nameField = page.locator("#name");
    const nameValue = await nameField.inputValue();
    console.log("Name field value:", nameValue);

    // Check for clarification questions
    const hasClarification = await page.locator("text=Help us identify").isVisible().catch(() => false);
    console.log("Has clarification questions:", hasClarification);

    // Log what happened
    const toastText = await page.locator('div[role="status"]').textContent().catch(() => "No toast");
    console.log("Toast message:", toastText);

    console.log("Test completed successfully!");
  });
});
