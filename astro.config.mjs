import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
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
