import { useEffect, useMemo, useState } from "react";
import type { CatalogEntry } from "../shell/catalog";
import { getHighScore } from "../sdk";
import { getOrCreateUser } from "../shell/user";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { EmptyState } from "./EmptyState";
import { ThemeToggle } from "./ThemeToggle";

const CATEGORY_LABEL: Record<string, string> = {
  arcade: "Arcade",
  puzzle: "Puzzle",
};

const SYSTEM_LABEL: Record<string, string> = {
  native: "HTML5",
  nes: "NES",
};

export type HomeScores = Record<string, number | null>;

export interface HomeViewProps {
  catalog: CatalogEntry[];
}

export function HomeView({ catalog }: HomeViewProps) {
  const [filter, setFilter] = useState<string>("all");
  const [nickname, setNickname] = useState<string>("bạn");
  const [scores, setScores] = useState<HomeScores>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const read = () => {
      const user = getOrCreateUser();
      setNickname(user.nickname);
      const s: HomeScores = {};
      for (const g of catalog) s[g.id] = getHighScore(g.id)?.score ?? null;
      setScores(s);
      setHydrated(true);
    };
    read();
    const onHash = () => {
      const hash = location.hash.slice(1) || "/";
      if (hash === "/") read();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [catalog]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const g of catalog) set.add(g.category);
    return Array.from(set);
  }, [catalog]);

  const continuePlaying = useMemo(
    () => catalog.filter((g) => (scores[g.id] ?? 0) > 0).slice(0, 4),
    [catalog, scores]
  );

  const filtered = useMemo(
    () => (filter === "all" ? catalog : catalog.filter((g) => g.category === filter)),
    [catalog, filter]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-hero leading-tight">Game Hub</h1>
          <p className="text-fg-muted text-base max-w-2xl">
            Chơi console kinh điển và mini-game HTML5 ngay trên trình duyệt. Xin chào{" "}
            <span className="text-fg font-medium">{nickname}</span>.
          </p>
        </div>
        <ThemeToggle className="mt-2 shrink-0" />
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Bộ lọc thể loại">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          Tất cả
        </Chip>
        {categories.map((cat) => (
          <Chip key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
            {CATEGORY_LABEL[cat] ?? cat}
          </Chip>
        ))}
      </div>

      {hydrated && continuePlaying.length > 0 ? (
        <section aria-labelledby="section-continue">
          <h2 id="section-continue" className="font-display text-xl mb-3 text-fg">
            Tiếp tục chơi
          </h2>
          <GameGrid games={continuePlaying} scores={scores} />
        </section>
      ) : null}

      <section aria-labelledby="section-all">
        <h2 id="section-all" className="font-display text-xl mb-3 text-fg">
          {filter === "all" ? "Tất cả game" : (CATEGORY_LABEL[filter] ?? filter)}
        </h2>
        {filtered.length === 0 ? (
          <EmptyState
            title="Không có game nào trong nhóm này"
            body="Thử bỏ bộ lọc để xem toàn bộ danh mục."
          />
        ) : (
          <GameGrid games={filtered} scores={scores} />
        )}
      </section>
    </main>
  );
}

function GameGrid({ games, scores }: { games: CatalogEntry[]; scores: HomeScores }) {
  return (
    <div
      data-testid="game-grid"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {games.map((g) => (
        <GameCard key={g.id} game={g} score={scores[g.id] ?? null} />
      ))}
    </div>
  );
}

function GameCard({ game, score }: { game: CatalogEntry; score: number | null }) {
  return (
    <Card
      as="a"
      href={`#/game/${game.slug}`}
      interactive
      data-slug={game.slug}
      className="game-card no-underline text-fg flex flex-col"
    >
      <img
        src={game.cover}
        alt={`Bìa ${game.title}`}
        loading="lazy"
        className="w-full aspect-[3/4] object-cover bg-black"
      />
      <div className="flex flex-col gap-1 p-3">
        <h3 className="font-display text-lg leading-tight">{game.title}</h3>
        {score !== null && score > 0 ? (
          <div className="text-sm text-success">Kỷ lục {score.toLocaleString("vi-VN")}</div>
        ) : (
          <div className="text-sm text-fg-muted">Chưa có kỷ lục</div>
        )}
        <div className="text-xs text-fg-muted font-mono uppercase tracking-wider">
          {CATEGORY_LABEL[game.category] ?? game.category} ·{" "}
          {SYSTEM_LABEL[game.system] ?? game.system}
        </div>
      </div>
    </Card>
  );
}
