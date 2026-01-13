import { test, expect, Page } from "@playwright/test";

async function loginAsTestUser(page: Page) {
  await page.goto("http://localhost:3000");
  if (page.url().includes("/auth/login")) {
    await page.click("text=Sign in as Test User");
    await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
  }
}

test.describe("Locations Feature", () => {
  test.setTimeout(60000); // 1 minute timeout

  test("settings page shows locations and allows CRUD operations", async ({ page }) => {
    await loginAsTestUser(page);

    // Use unique names for this test run
    const testId = Date.now();
    const testLocationName = `Test E2E Location ${testId}`;
    const updatedLocationName = `Updated E2E Location ${testId}`;

    // Navigate to settings via the gear icon
    await page.click('button[title="Manage locations"]');
    await expect(page).toHaveURL(/\/settings\/locations/);

    // Verify page loaded
    await expect(page.locator("h1:has-text('Locations')")).toBeVisible();

    // Take screenshot of initial state
    await page.screenshot({ path: "e2e/screenshots/locations-01-settings-page.png" });

    // Wait for loading to complete
    await expect(page.locator("text=Loading")).not.toBeVisible({ timeout: 10000 });

    // Check if locations are displayed (default seeded locations)
    const locationItems = page.locator('[class*="rounded-lg"][class*="border"][class*="bg-card"]');
    await expect(locationItems.first()).toBeVisible({ timeout: 10000 });

    const count = await locationItems.count();
    console.log(`Found ${count} locations`);
    expect(count).toBeGreaterThan(0);

    // Test Add Location - click button in header
    await page.locator('header button:has-text("Add Location")').click();

    // Wait for modal to open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Location' })).toBeVisible();

    // Fill in location name
    const nameInput = page.locator("#location-name");
    await nameInput.fill(testLocationName);

    // Select an icon (click the garage icon)
    await page.locator('button:has-text("🚗")').click();

    // Take screenshot of modal
    await page.screenshot({ path: "e2e/screenshots/locations-02-add-modal.png" });

    // Submit
    await page.getByRole('button', { name: 'Create Location' }).click();

    // Wait for modal to close and verify location was added
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${testLocationName}`).first()).toBeVisible({ timeout: 5000 });

    // Take screenshot after adding
    await page.screenshot({ path: "e2e/screenshots/locations-03-after-add.png" });

    // Test Edit Location - find the row and click the edit button (pencil icon)
    const testLocationRow = page.locator(`[class*="rounded-lg"][class*="border"]:has-text("${testLocationName}")`);
    await testLocationRow.locator('button').first().click(); // First button is edit (pencil)

    // Verify edit modal opened with pre-filled values
    await expect(page.getByRole('heading', { name: 'Edit Location' })).toBeVisible();
    const editNameInput = page.locator("#location-name");
    await expect(editNameInput).toHaveValue(testLocationName);

    // Change the name
    await editNameInput.clear();
    await editNameInput.fill(updatedLocationName);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify name was updated
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${updatedLocationName}`).first()).toBeVisible({ timeout: 5000 });

    // Take screenshot after edit
    await page.screenshot({ path: "e2e/screenshots/locations-04-after-edit.png" });

    // Test Delete Location (this location has 0 items so should delete directly)
    const updatedLocationRow = page.locator(`[class*="rounded-lg"][class*="border"]:has-text("${updatedLocationName}")`);
    // Delete button is the second button (red trash icon)
    await updatedLocationRow.locator('button').nth(1).click();

    // Verify delete modal appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('text=This location has no items')).toBeVisible();

    // Confirm delete
    await page.getByRole('button', { name: 'Delete Location' }).click();

    // Verify location was deleted
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${updatedLocationName}`)).not.toBeVisible({ timeout: 5000 });

    // Take screenshot after delete
    await page.screenshot({ path: "e2e/screenshots/locations-05-after-delete.png" });

    console.log("Settings page CRUD test completed!");
  });

  test("LocationSelector allows inline creation in add item dialog", async ({ page }) => {
    await loginAsTestUser(page);

    // Click Add Item button
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Fill in basic item info first
    await page.locator("#name").fill("E2E Test Item");

    // Select category using CategorySelector (first combobox in dialog)
    const categoryCombobox = page.getByRole('dialog').locator('button[role="combobox"]').first();
    await expect(categoryCombobox).toBeVisible({ timeout: 10000 });
    await expect(categoryCombobox).toBeEnabled({ timeout: 15000 });
    await categoryCombobox.click();
    await expect(page.locator('[cmdk-input]')).toBeVisible();
    await page.locator('[cmdk-item]:has-text("Furniture")').click();
    // Wait for category popover to close
    await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Take screenshot before location selection
    await page.screenshot({ path: "e2e/screenshots/locations-06-before-location.png" });

    // Click the location selector (combobox) - wait for loading to complete
    // The LocationSelector is the second combobox in the dialog (first is Category)
    const locationSelector = page.getByRole('dialog').locator('button[role="combobox"]').nth(1);
    await expect(locationSelector).toBeVisible({ timeout: 10000 });
    // Wait for loading to finish (button becomes enabled)
    await expect(locationSelector).toBeEnabled({ timeout: 15000 });
    await locationSelector.click();

    // Wait for dropdown to open
    await expect(page.locator('[cmdk-input]')).toBeVisible();

    // Take screenshot of location dropdown
    await page.screenshot({ path: "e2e/screenshots/locations-07-location-dropdown.png" });

    // Type a new location name that doesn't exist
    const uniqueLocationName = `Inline Location ${Date.now()}`;
    await page.locator('[cmdk-input]').fill(uniqueLocationName);

    // Should show "Create" option
    await expect(page.locator(`text=Create "${uniqueLocationName}"`)).toBeVisible();

    // Click to create
    await page.locator(`[cmdk-item]:has-text("Create")`).click();

    // Verify the location was selected (dropdown should close and show the new location)
    await expect(page.locator('button[role="combobox"]').filter({ hasText: uniqueLocationName })).toBeVisible({ timeout: 5000 });

    // Take screenshot after inline creation
    await page.screenshot({ path: "e2e/screenshots/locations-08-inline-created.png" });

    // Now submit the item
    await page.locator('button[type="submit"]:has-text("Add Item")').click();

    // Wait for dialog to close and item to appear in list
    await expect(page.locator("text=Add New Item")).not.toBeVisible({ timeout: 15000 });

    // Take screenshot of item in list
    await page.screenshot({ path: "e2e/screenshots/locations-09-item-in-list.png" });

    // Verify the item shows in the list with the location
    // Wait for list to refresh and verify item exists in DOM
    await page.waitForTimeout(2000);
    // Scroll the page to trigger any lazy loading
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Check that the location name exists somewhere on the page
    const locationText = page.getByText(uniqueLocationName);
    const count = await locationText.count();
    console.log(`Found ${count} elements with location name`);
    expect(count).toBeGreaterThan(0);

    console.log("Inline location creation test completed!");
  });

  test("item displays location badge correctly", async ({ page }) => {
    await loginAsTestUser(page);

    // First, add an item with a specific location
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    // Fill in item details
    const itemName = `Badge Test Item ${Date.now()}`;
    await page.locator("#name").fill(itemName);

    // Select category (first combobox in dialog)
    const categoryCombobox2 = page.getByRole('dialog').locator('button[role="combobox"]').first();
    await expect(categoryCombobox2).toBeVisible({ timeout: 10000 });
    await expect(categoryCombobox2).toBeEnabled({ timeout: 15000 });
    await categoryCombobox2.click();
    await expect(page.locator('[cmdk-input]')).toBeVisible();
    await page.locator('[cmdk-item]:has-text("Electronics")').click();
    // Wait for category popover to close
    await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Select an existing location (Living Room should be seeded)
    // The LocationSelector is the second combobox in the dialog (first is Category)
    const locationCombobox = page.getByRole('dialog').locator('button[role="combobox"]').nth(1);
    await expect(locationCombobox).toBeVisible({ timeout: 10000 });
    await expect(locationCombobox).toBeEnabled({ timeout: 15000 });
    await locationCombobox.click();
    await expect(page.locator('[cmdk-input]')).toBeVisible();

    // Click on Living Room (should be in the list from seeding)
    await page.locator('[cmdk-item]:has-text("Living Room")').click();

    // Submit the item
    await page.locator('button[type="submit"]:has-text("Add Item")').click();

    // Wait for dialog to close
    await expect(page.locator("text=Add New Item")).not.toBeVisible({ timeout: 15000 });

    // Take screenshot of inventory list
    await page.screenshot({ path: "e2e/screenshots/locations-10-item-with-badge.png" });

    // Find the item in the list
    // Wait for list to refresh and verify item exists in DOM
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Check that the item exists in DOM
    const itemCount = await page.getByText(itemName).count();
    console.log(`Found ${itemCount} elements with item name`);
    expect(itemCount).toBeGreaterThan(0);

    // Verify Living Room location badge exists on the page
    const livingRoomCount = await page.getByText('Living Room').count();
    console.log(`Found ${livingRoomCount} Living Room badges`);
    expect(livingRoomCount).toBeGreaterThan(0);

    console.log("Location badge display test completed!");
  });

  test("edit item allows changing location", async ({ page }) => {
    await loginAsTestUser(page);

    // First create an item
    await page.click("text=Add Item");
    await expect(page.locator("text=Add New Item")).toBeVisible();

    const itemName = `Edit Location Test ${Date.now()}`;
    await page.locator("#name").fill(itemName);

    // Select category (first combobox in dialog)
    const categoryCombobox3 = page.getByRole('dialog').locator('button[role="combobox"]').first();
    await expect(categoryCombobox3).toBeVisible({ timeout: 10000 });
    await expect(categoryCombobox3).toBeEnabled({ timeout: 15000 });
    await categoryCombobox3.click();
    await expect(page.locator('[cmdk-input]')).toBeVisible();
    await page.locator('[cmdk-item]:has-text("Decor")').click();
    // Wait for category popover to close
    await expect(page.locator('[cmdk-input]')).not.toBeVisible({ timeout: 5000 });

    // Select Living Room
    // The LocationSelector is the second combobox in the dialog (first is Category)
    const locationComboboxAdd = page.getByRole('dialog').locator('button[role="combobox"]').nth(1);
    await expect(locationComboboxAdd).toBeVisible({ timeout: 10000 });
    await expect(locationComboboxAdd).toBeEnabled({ timeout: 15000 });
    await locationComboboxAdd.click();
    await page.locator('[cmdk-item]:has-text("Living Room")').click();

    await page.locator('button[type="submit"]:has-text("Add Item")').click();

    // Wait for dialog to close
    await expect(page.locator("text=Add New Item")).not.toBeVisible({ timeout: 15000 });

    // Wait for item to appear
    // Wait for list to refresh
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Check that the item exists in DOM
    const itemCount = await page.getByText(itemName).count();
    console.log(`Found ${itemCount} elements with item name`);
    expect(itemCount).toBeGreaterThan(0);

    // Find the item row and click the dropdown menu (Actions button with sr-only text)
    // The item might be in a table row or a card
    const itemRow = page.locator(`tr:has-text("${itemName}")`);
    const itemCard = page.locator(`[class*="Card"]:has-text("${itemName}")`);

    // Click the Actions dropdown trigger (button with sr-only "Actions" text)
    const actionsButton = itemRow.getByRole('button', { name: 'Actions' }).or(
      itemCard.getByRole('button', { name: 'Actions' })
    ).first();
    await actionsButton.click();

    // Click Edit from the dropdown
    await page.locator('[role="menuitem"]:has-text("Edit")').click();

    // Verify edit dialog opened
    await expect(page.locator("text=Edit Item")).toBeVisible();

    // Take screenshot of edit dialog
    await page.screenshot({ path: "e2e/screenshots/locations-11-edit-dialog.png" });

    // Change the location to Bedroom - the combobox shows "Living Room" now
    // The LocationSelector is the second combobox in the dialog (first is Category)
    const editLocationCombobox = page.getByRole('dialog').locator('button[role="combobox"]').nth(1);
    await editLocationCombobox.click();
    await expect(page.locator('[cmdk-input]')).toBeVisible();
    await page.locator('[cmdk-item]:has-text("Bedroom")').click();

    // Save changes
    await page.getByRole('button', { name: 'Update Item' }).click();

    // Wait for dialog to close
    await expect(page.locator("text=Edit Item")).not.toBeVisible({ timeout: 10000 });

    // Take screenshot after edit
    await page.screenshot({ path: "e2e/screenshots/locations-12-after-location-change.png" });

    console.log("Edit item location test completed!");
  });
});
