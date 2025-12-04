import { test, expect } from "@playwright/test";

test("complete user authentication flow", async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@gmail.com`,
    password: "thisIsatTestPass1!",
  };

  console.log("===== Starting authentication E2E test =====");

  await page.goto("/signup");
  await expect(page).toHaveURL(/\/signup/i);
  console.log("On signup page");

  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill(testUser.username);
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(testUser.email);
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill(testUser.password);
  console.log("Form filled");

  await page.click('button:has-text("Sign Up")[type="submit"]');

  console.log("Registration successful, redirected to dashboard");

  const welcomePage = page.getByText("Welcome back");
  await expect(welcomePage).toBeVisible();

  console.log("Authentication test success");
});
