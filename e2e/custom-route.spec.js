import { test, expect } from "@playwright/test";
import { time, timeStamp } from "console";

test("complete user authentication flow", async ({ page }) => {
  const timestamp = Date.now();
  const testUser = {
    username: `testuser1_${timestamp}`,
    email: `test1_${timestamp}@gmail.com`,
    password: "thisIsatTestPass1!",
  };

  console.log("===== Starting custom route test =====");
  await page.goto("/signup");
  await expect(page).toHaveURL("/signup");
  console.log("On signup page");

  await page.fill('p:has-text("Username") + input', testUser.username);
  await page.fill('p:has-text("Email") + input', testUser.email);
  await page.fill('p:has-text("Password") + input', testUser.password);
  await page.click('button:has-text("Sign Up")[type="submit"]');

  await page.waitForURL("/Dashboard");
  await page.getByRole("link", { name: "New Request" }).click();

  await page.locator("input").click();
  await page.locator("input").fill(`Test Custom Route ${timestamp}`);
  await page.getByRole("combobox").first().selectOption("custom");
  await page
    .locator("div")
    .filter({ hasText: /^\+− Leaflet$/ })
    .first()
    .click();
  await page.getByRole("combobox").nth(1).selectOption("custom");
  await page
    .locator("div")
    .filter({ hasText: /^\+− Leaflet$/ })
    .nth(2)
    .click();
  await page.getByRole("button", { name: "Create Request" }).click();

  const notif = page.getByText(`Test Custom Route ${timestamp}`);
  await expect(notif).toBeVisible();
});
