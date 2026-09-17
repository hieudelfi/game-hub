import { test, expect } from "@playwright/test";

test("landing page loads and shows title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Game Hub/);
  await expect(page.locator("h1")).toContainText("Game Hub");
});

test("landing page has correct language attribute", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});
