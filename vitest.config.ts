import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    exclude: ["node_modules", "dist", ".astro", "tests/e2e"],
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
});
