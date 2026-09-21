import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

/*
 * Visual regression baseline — 6 screen: home/game/result × dark/light.
 * Chay local: `pnpm test:e2e -- --update-snapshots` sinh -chromium-win32.png.
 * Sinh baseline linux cho CI:
 *   - Cach 1: chay workflow_dispatch ".github/workflows/visual-baselines.yml"
 *   - Cach 2: local co Docker → `bash scripts/gen-linux-baselines.sh`
 * Sau khi -chromium-linux.png ton tai trong thu muc snapshot, CI tu dong bat visual test.
 */

const SNAPSHOT_DIR = path.resolve(process.cwd(), "tests/e2e/visual.spec.ts-snapshots");

function hasLinuxBaselines(): boolean {
  try {
    return fs.readdirSync(SNAPSHOT_DIR).some((f) => f.endsWith("-chromium-linux.png"));
  } catch {
    return false;
  }
}

test.skip(
  !!process.env.CI && !hasLinuxBaselines(),
  "CI: thieu chromium-linux baseline. Chay workflow 'Visual baselines (regenerate)' de sinh."
);

test.use({ viewport: { width: 1024, height: 768 } });

const THEMES = ["dark", "light"] as const;
type Theme = (typeof THEMES)[number];

async function seedContext(page: import("@playwright/test").Page, theme: Theme) {
  await page.addInitScript(
    ({ theme }) => {
      localStorage.setItem("gh:theme-pref", theme);
      localStorage.setItem(
        "gh:user",
        JSON.stringify({
          id: "00000000-0000-0000-0000-000000000000",
          nickname: "Người chơi thử",
          avatarUrl: null,
        })
      );
    },
    { theme }
  );
}

for (const theme of THEMES) {
  test.describe(`theme=${theme}`, () => {
    test(`baseline home @ ${theme}`, async ({ page }) => {
      await seedContext(page, theme);
      await page.goto("/");
      await page.locator('[data-testid="game-grid"]').waitFor({ state: "visible" });
      await expect(page).toHaveScreenshot(`home-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });

    test(`baseline game (canvas masked) @ ${theme}`, async ({ page }) => {
      await seedContext(page, theme);
      await page.goto("/#/game/snake");
      const canvas = page.locator('[data-testid="game-canvas"]');
      await canvas.waitFor({ state: "visible" });
      await expect(page).toHaveScreenshot(`game-${theme}.png`, {
        fullPage: true,
        mask: [canvas],
        maxDiffPixelRatio: 0.02,
      });
    });

    test(`baseline result @ ${theme}`, async ({ page }) => {
      await seedContext(page, theme);
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
      await page.locator('[data-testid="final-score"]').waitFor({ state: "visible" });
      await expect(page).toHaveScreenshot(`result-${theme}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  });
}
