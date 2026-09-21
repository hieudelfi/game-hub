import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function serious(violations: Array<{ impact?: string | null }>) {
  return violations.filter((v) => v.impact === "critical" || v.impact === "serious");
}

test("home has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-testid="game-grid"]').waitFor({ state: "visible" });
  const results = await new AxeBuilder({ page }).analyze();
  expect(serious(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("home @ light theme has no serious/critical axe violations", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("gh:theme-pref", "light"));
  await page.goto("/");
  await page.locator('[data-testid="game-grid"]').waitFor({ state: "visible" });
  const results = await new AxeBuilder({ page }).analyze();
  expect(serious(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("game view has no serious/critical axe violations", async ({ page }) => {
  await page.goto("/#/game/snake");
  await page.locator('[data-testid="game-canvas"]').waitFor({ state: "visible" });
  const results = await new AxeBuilder({ page }).analyze();
  expect(serious(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("result screen has no serious/critical axe violations", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "gh:last-result:snake",
      JSON.stringify({
        score: 200,
        isHighScore: true,
        previousHighScore: 100,
        durationSec: 90,
      })
    );
  });
  await page.goto("/#/result/snake");
  await page.locator('[data-testid="final-score"]').waitFor({ state: "visible" });
  const results = await new AxeBuilder({ page }).analyze();
  expect(serious(results.violations), JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("keyboard-only: Tab từ home vào card đầu tiên rồi Enter mở game", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-testid="game-grid"]').waitFor({ state: "visible" });
  const firstCard = page.locator(".game-card").first();
  const targetSlug = await firstCard.getAttribute("data-slug");

  // Tab tới khi focus rơi vào card đầu tiên (giới hạn 20 phím Tab để tránh loop)
  let reached = false;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.dataset?.slug
    );
    if (focused === targetSlug) {
      reached = true;
      break;
    }
  }
  expect(reached, "không Tab tới được card đầu tiên trong 20 phím").toBe(true);

  await page.keyboard.press("Enter");
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
});

test("game view có landmark main", async ({ page }) => {
  await page.goto("/#/game/snake");
  await page.locator('[data-testid="game-canvas"]').waitFor({ state: "visible" });
  await expect(page.locator("#app main")).toBeVisible();
});
