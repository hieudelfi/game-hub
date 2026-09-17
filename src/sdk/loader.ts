import type { GameModule } from "./types";

const modules = import.meta.glob<GameModule>("/src/games/*/game.ts");

export async function loadGame(slug: string): Promise<GameModule> {
  const key = `/src/games/${slug}/game.ts`;
  const loader = modules[key];
  if (!loader) throw new Error(`Không tìm thấy game plugin: ${slug}`);
  return loader();
}

export function listAvailableSlugs(): string[] {
  return Object.keys(modules)
    .map((k) => {
      const m = k.match(/\/src\/games\/([^/]+)\/game\.ts$/);
      return m ? m[1] : "";
    })
    .filter(Boolean);
}
