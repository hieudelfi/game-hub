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

test("result screen shows score, badge, and CTAs (redesigned)", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "gh:last-result:snake",
      JSON.stringify({
        score: 142,
        isHighScore: true,
        previousHighScore: 100,
        durationSec: 84,
      })
    );
  });
  await page.goto("/#/result/snake");
  await expect(page.locator('[data-testid="final-score"]')).toHaveText("142");
  await expect(page.getByText("Kỷ lục mới")).toBeVisible();
  await expect(page.getByRole("link", { name: "Chơi lại" })).toBeVisible();
  await expect(page.locator("a", { hasText: /^Về trang chủ$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thử game khác" })).toBeVisible();
});

test("reduced-motion: card hover does not translate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const card = page.locator(".game-card").first();
  await card.waitFor({ state: "visible" });
  await card.hover();
  await page.waitForTimeout(50);
  const transform = await card.evaluate((el) => getComputedStyle(el).transform);
  expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
});

test("touch controls hidden on desktop", async ({ page }) => {
  await page.goto("/#/game/snake");
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await expect(page.locator('[data-testid="touch-controls"]')).toBeHidden();
});

test.describe("mobile viewport (pointer: coarse)", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });

  test("touch controls visible on mobile viewport", async ({ page }) => {
    await page.goto("/#/game/snake");
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="touch-controls"]')).toBeVisible();
    await expect(page.locator('[data-touch="up"]')).toBeVisible();
    await expect(page.locator('[data-touch="a"]')).toBeVisible();
  });
});
