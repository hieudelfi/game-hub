import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  build: {
    assets: "assets",
    inlineStylesheets: "auto",
  },
  compressHTML: true,
  server: {
    port: 4321,
    host: false,
  },
});
