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

test("catalog grid renders Snake card", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator('[data-testid="game-grid"]');
  await expect(grid).toBeVisible();
  await expect(grid.locator(".game-card")).toHaveCount(1);
  await expect(grid.locator('[data-slug="snake"]')).toBeVisible();
});

test("clicking Snake card loads game canvas", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-slug="snake"]').click();
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await expect(page.locator(".game-view__title")).toContainText("Snake");
  await expect(page.locator("#back-btn")).toBeVisible();
  await expect(page.locator("#fullscreen-btn")).toBeVisible();
});

test("back button returns to home", async ({ page }) => {
  await page.goto("/#/game/snake");
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await page.locator("#back-btn").click();
  await expect(page.locator('[data-testid="game-grid"]')).toBeVisible();
});
