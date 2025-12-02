import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("/signup");
  await expect(page).toHaveURL("/signup");
  console.log("On signup page");
  await page.getByRole("link", { name: "Sign Up" }).click();
  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("test@g.com");
  await page.getByRole("textbox").first().press("Tab");
  await page.locator('input[type="email"]').fill("test@g.com");
  await page.locator('input[type="email"]').press("Tab");
  await page.locator('input[type="password"]').fill("");
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill("Password123!");
  await page.locator("form").getByRole("button", { name: "Sign Up" }).click();
  let warning = page.getByText("Username and email cannot be the same");
  await expect(warning).toBeVisible();
  console.log("Same username and email validated");

  await page.getByRole("textbox").first().click();
  await page.getByRole("textbox").first().fill("test");
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill("test@g");
  await page.locator('input[type="password"]').click();
  await page.locator("form").getByRole("button", { name: "Sign Up" }).click();
  warning = page.getByText("Please enter a valid email address");
  await expect(warning).toBeVisible();
  console.log("Email not correct format validated");

  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill("test@g.com");
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press("ControlOrMeta+a");
  await page.locator('input[type="password"]').fill("Password");
  await page.locator('input[type="password"]').press("ControlOrMeta+a");
  await page.locator('input[type="password"]').fill("Password12");
  await page.locator("form").getByRole("button", { name: "Sign Up" }).click();
  warning = page.getByText(
    "Password must have: ≥8 characters, uppercase letter, lowercase letter, special character: @$!%*?&."
  );
  await expect(warning).toBeVisible();

  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill("password12!");
  warning = page.getByText(
    "Password must have: ≥8 characters, uppercase letter, lowercase letter, special character: @$!%*?&."
  );
  await expect(warning).toBeVisible();
  console.log("Password not meeting standards validated");
  await page.locator("form").getByRole("button", { name: "Sign Up" }).click();
});
