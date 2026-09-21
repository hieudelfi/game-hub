import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const OUT = path.resolve(process.cwd(), "docs/design/screens");
const BPS = [
  { w: 360, h: 800, name: "360" },
  { w: 390, h: 844, name: "390" },
  { w: 768, h: 1024, name: "768" },
  { w: 1024, h: 768, name: "1024" },
  { w: 1440, h: 900, name: "1440" },
];

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

for (const bp of BPS) {
  test(`home @ ${bp.name}: no horizontal overflow + screenshot`, async ({ page }) => {
    await page.setViewportSize({ width: bp.w, height: bp.h });
    await page.goto("/");
    await page.locator('[data-testid="game-grid"]').waitFor({ state: "visible" });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(
      scrollWidth,
      `home overflows ngang @ ${bp.w}: scrollWidth=${scrollWidth}`
    ).toBeLessThanOrEqual(bp.w);
    await page.screenshot({
      path: path.join(OUT, `home-${bp.name}.png`),
      fullPage: true,
    });
  });
}

test("game view @ 360: canvas không tràn ngang", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/#/game/snake");
  await page.locator('[data-testid="game-canvas"]').waitFor({ state: "visible" });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(360);
});

test("result @ 360: không tràn ngang", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "gh:last-result:snake",
      JSON.stringify({
        score: 42,
        isHighScore: true,
        previousHighScore: 0,
        durationSec: 30,
      })
    );
  });
  await page.goto("/#/result/snake");
  await page.locator('[data-testid="final-score"]').waitFor({ state: "visible" });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(360);
});
