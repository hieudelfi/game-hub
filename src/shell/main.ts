import { loadCatalog } from "./catalog";
import { getOrCreateUser } from "./user";
import { registerServiceWorker } from "./sw";
import { watchSystemPref } from "./theme";
import { renderGame } from "./views/game";
import { renderResult } from "./views/result";

type Cleanup = () => Promise<void>;

let currentCleanup: Cleanup | null = null;

function showHome(): void {
  const home = document.getElementById("home-root");
  const app = document.getElementById("app");
  if (home) home.hidden = false;
  if (app) {
    app.innerHTML = "";
    app.hidden = true;
  }
}

function showApp(): void {
  const home = document.getElementById("home-root");
  const app = document.getElementById("app");
  if (home) home.hidden = true;
  if (app) app.hidden = false;
}

async function route(): Promise<void> {
  if (currentCleanup) {
    const c = currentCleanup;
    currentCleanup = null;
    await c();
  }

  const hash = location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  const [section, slug] = parts;

  if (section === "game" && slug) {
    const catalog = loadCatalog();
    const user = getOrCreateUser();
    showApp();
    currentCleanup = await renderGame(catalog, slug, user);
  } else if (section === "result" && slug) {
    const catalog = loadCatalog();
    showApp();
    renderResult(catalog, slug);
  } else {
    showHome();
  }
}

window.addEventListener("hashchange", () => {
  void route();
});

void route();
registerServiceWorker();
watchSystemPref();
