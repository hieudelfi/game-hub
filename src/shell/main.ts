import "./styles.css";
import { loadCatalog } from "./catalog";
import { getOrCreateUser } from "./user";
import { renderHome } from "./views/home";
import { renderGame } from "./views/game";
import { renderResult } from "./views/result";

type Cleanup = () => Promise<void>;

let currentCleanup: Cleanup | null = null;

async function route(): Promise<void> {
  if (currentCleanup) {
    const c = currentCleanup;
    currentCleanup = null;
    await c();
  }

  const catalog = loadCatalog();
  const user = getOrCreateUser();
  const hash = location.hash.slice(1) || "/";
  const parts = hash.split("/").filter(Boolean);
  const [section, slug] = parts;

  if (section === "game" && slug) {
    currentCleanup = await renderGame(catalog, slug, user);
  } else if (section === "result" && slug) {
    renderResult(catalog, slug);
  } else {
    renderHome(catalog, user);
  }
}

window.addEventListener("hashchange", () => {
  void route();
});

void route();
