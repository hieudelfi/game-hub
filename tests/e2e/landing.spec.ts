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

test("catalog grid renders all game cards", async ({ page }) => {
  await page.goto("/");
  const grid = page.locator('[data-testid="game-grid"]');
  await expect(grid).toBeVisible();
  await expect(grid.locator(".game-card")).toHaveCount(3);
  await expect(grid.locator('[data-slug="snake"]')).toBeVisible();
  await expect(grid.locator('[data-slug="tetris"]')).toBeVisible();
  await expect(grid.locator('[data-slug="flappy"]')).toBeVisible();
});

test("clicking Snake card loads game canvas", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-slug="snake"]').click();
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await expect(page.locator(".game-view__title")).toContainText("Snake");
  await expect(page.locator("#back-btn")).toBeVisible();
  await expect(page.locator("#fullscreen-btn")).toBeVisible();
});

test("clicking Tetris card loads Tetris canvas", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-slug="tetris"]').click();
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await expect(page.locator(".game-view__title")).toContainText("Tetris");
});

test("clicking Flappy card loads Flappy canvas", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-slug="flappy"]').click();
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await expect(page.locator(".game-view__title")).toContainText("Flappy");
});

test("back button returns to home", async ({ page }) => {
  await page.goto("/#/game/snake");
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await page.locator("#back-btn").click();
  await expect(page.locator('[data-testid="game-grid"]')).toBeVisible();
});

test("service worker file served at /sw.js", async ({ request }) => {
  const response = await request.get("/sw.js");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("CACHE_NAME");
  expect(body).toContain("cacheFirst");
});
