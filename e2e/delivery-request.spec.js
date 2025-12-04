import { test, expect } from "@playwright/test";

test("delivery request creation and routing flow", async ({ page }) => {
  console.log("🚀 Starting delivery request E2E test...");

  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@gmail.com`,
    password: "thisIsatTestPass1!",
  };
  const deliveryRequest = {
    item: `Test Item ${timestamp}`,
    pickupKey: "De Neve",
    dropoffKey: "Olympic Hall",
  };

  console.log("===== Starting delivery test =====");

  //create new user
  await page.goto("/signup");
  await expect(page).toHaveURL("/signup");
  console.log("On signup page");

  await page.fill('p:has-text("Username") + input', testUser.username);
  await page.fill('p:has-text("Email") + input', testUser.email);
  await page.fill('p:has-text("Password") + input', testUser.password);
  console.log("Form filled");

  await page.click('button:has-text("Sign Up")[type="submit"]');

  await page.waitForURL("/Dashboard");

  console.log("Registration successful, redirected to dashboard");

  await expect(page.locator("text=Profile")).toBeVisible();

  console.log("Authentication test success");

  //navigate to new request page
  await page.goto("/requests/new");
  await expect(page).toHaveURL("/requests/new");
  console.log("Navigated to new request page");

  await page.fill(
    'p:has-text("Item") + input, input[placeholder*="Item"]',
    deliveryRequest.item
  );

  await page.getByRole("combobox").first().selectOption("deneve");
  await page.getByRole("combobox").nth(1).selectOption("rolfe");

  console.log("Delivery request form filled");

  await page.click(
    'button[type="submit"]:has-text("Create"), button:has-text("Create Request")'
  );

  await page.waitForResponse(
    (response) =>
      response.url().includes("/api/requests") && response.status() === 201
  );
  console.log("Delivery request submitted successfully");

  // verify request appears
  await expect(page).toHaveURL("/requests");
  console.log("Redirected to requests page");

  await page.waitForTimeout(1000);
  await expect(
    page.locator(`text=${deliveryRequest.item}`).first()
  ).toBeVisible();
  console.log("Delivery request appears in list");

  console.log("Delivery request successful");
});
