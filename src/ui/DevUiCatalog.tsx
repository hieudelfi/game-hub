import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  StagePanel,
  ThemeToggle,
  Toast,
  Toolbar,
} from "./index";

let nextId = 1;
type QueuedToast = {
  id: number;
  tone: "neutral" | "success" | "warn" | "error";
  msg: string;
};

export function DevUiCatalog() {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);

  function push(tone: QueuedToast["tone"], msg: string) {
    setToasts((prev) => [...prev, { id: nextId++, tone, msg }]);
  }
  function remove(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <>
      <Section id="button" title="Button">
        <Row label="variant × size">
          <Button variant="primary" size="sm">
            Primary sm
          </Button>
          <Button variant="primary" size="md">
            Primary md
          </Button>
          <Button variant="ghost" size="sm">
            Ghost sm
          </Button>
          <Button variant="ghost" size="md">
            Ghost md
          </Button>
          <Button variant="danger" size="sm">
            Danger sm
          </Button>
          <Button variant="danger" size="md">
            Danger md
          </Button>
        </Row>
        <Row label="iconLeft">
          <Button iconLeft={<PlayIcon />}>Chơi ngay</Button>
          <Button variant="ghost" iconLeft={<BackIcon />}>
            Quay lại
          </Button>
        </Row>
        <Row label="disabled + loading">
          <Button disabled>Disabled</Button>
          <Button variant="ghost" disabled>
            Ghost disabled
          </Button>
          <Button loading>Đang lưu…</Button>
        </Row>
      </Section>

      <Section id="card" title="Card">
        <Row label="static">
          <Card className="p-4 max-w-xs">
            <p className="font-display text-lg mb-1">Snake</p>
            <p className="text-sm text-fg-muted">Kỷ lục 128 · Arcade</p>
          </Card>
        </Row>
        <Row label="interactive as='a'">
          <Card as="a" href="#/g/snake" interactive className="p-4 max-w-xs no-underline text-fg">
            <p className="font-display text-lg mb-1">Tetris</p>
            <p className="text-sm text-fg-muted">Kỷ lục 1024 · Puzzle</p>
          </Card>
        </Row>
      </Section>

      <Section id="toolbar" title="Toolbar">
        <Row label="left + title + right">
          <div className="w-full rounded-md border border-border overflow-hidden">
            <Toolbar
              left={
                <Button variant="ghost" size="sm" iconLeft={<BackIcon />}>
                  Về trang chủ
                </Button>
              }
              right={
                <>
                  <Badge tone="success">Best 128</Badge>
                  <Button variant="ghost" size="sm">
                    Toàn màn
                  </Button>
                </>
              }
            >
              <h2 className="font-display text-lg text-center">Snake</h2>
            </Toolbar>
            <div className="p-6 text-sm text-fg-muted">Nội dung dưới toolbar…</div>
          </div>
        </Row>
      </Section>

      <Section id="badge" title="Badge">
        <Row label="tone">
          <Badge>neutral</Badge>
          <Badge tone="success">success · KỶ LỤC MỚI</Badge>
          <Badge tone="warn">warn · offline</Badge>
          <Badge tone="error">error · lỗi tải</Badge>
        </Row>
      </Section>

      <Section id="toast" title="Toast">
        <Row label="static">
          <Toast tone="neutral" duration={0} dismissible={false}>
            Đã lưu tiến trình.
          </Toast>
          <Toast tone="success" duration={0} dismissible={false}>
            Kỷ lục mới!
          </Toast>
          <Toast tone="warn" duration={0} dismissible={false}>
            Đang chơi offline — điểm chưa đồng bộ.
          </Toast>
          <Toast tone="error" duration={0} dismissible={false}>
            Không tải được game.
          </Toast>
        </Row>
        <Row label="live queue (auto-dismiss 4s)">
          <Button variant="ghost" size="sm" onClick={() => push("neutral", "Info · " + Date.now())}>
            + neutral
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => push("success", "Success · " + Date.now())}
          >
            + success
          </Button>
          <Button variant="ghost" size="sm" onClick={() => push("warn", "Warn · " + Date.now())}>
            + warn
          </Button>
          <Button variant="ghost" size="sm" onClick={() => push("error", "Error · " + Date.now())}>
            + error
          </Button>
        </Row>
        <div
          className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-80"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <Toast key={t.id} tone={t.tone} onDismiss={() => remove(t.id)}>
              {t.msg}
            </Toast>
          ))}
        </div>
      </Section>

      <Section id="chip" title="Chip">
        <Row label="filter group">
          <ChipDemo />
        </Row>
      </Section>

      <Section id="stage" title="StagePanel">
        <Row label="canvas frame + hud + controls slots">
          <StagePanel
            hud={
              <div className="flex items-center gap-2 justify-between px-1 text-sm">
                <span className="font-mono text-fg-muted">Score 042</span>
                <Badge tone="success">Best 128</Badge>
              </div>
            }
            controls={
              <p className="text-xs text-fg-muted text-center">
                Slot controls · dpad + AB đi vào đây khi mobile.
              </p>
            }
          >
            <div className="w-52 h-40 bg-black rounded-md grid place-items-center text-fg-muted text-xs font-mono">
              canvas placeholder
            </div>
          </StagePanel>
        </Row>
      </Section>

      <Section id="theme" title="ThemeToggle">
        <Row label="cycle system → light → dark">
          <ThemeToggle />
          <span className="text-sm text-fg-muted">
            Trạng thái ghi vào <code className="font-mono">gh:theme-pref</code> trong LocalStorage.
          </span>
        </Row>
      </Section>

      <Section id="empty" title="EmptyState">
        <Row label="với action">
          <EmptyState
            className="w-full"
            icon={<EmptyIcon />}
            title="Chưa có game nào"
            body="Danh mục sẽ hiện ở đây sau khi bạn thêm game đầu tiên."
            action={
              <Button variant="primary" iconLeft={<PlusIcon />}>
                Thêm game
              </Button>
            }
          />
        </Row>
      </Section>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-md border border-border bg-bg-elev p-4 shadow-1">
      <h2 className="font-display text-lg mb-3">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <p className="text-xs font-mono text-fg-muted uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function ChipDemo() {
  const [pick, setPick] = useState<string>("all");
  const opts = ["all", "arcade", "puzzle", "featured"] as const;
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <Chip key={o} active={pick === o} onClick={() => setPick(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M4 3l9 5-9 5V3z" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3L4 8l6 5" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
function EmptyIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="6" y="8" width="20" height="16" rx="2" />
      <path d="M6 14h20M12 8V6M20 8V6" strokeLinecap="round" />
    </svg>
  );
}
