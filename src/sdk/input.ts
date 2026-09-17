import type { Button, InputSystem } from "./types";

const DEFAULT_KEYMAP: Record<string, Button> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  KeyZ: "a",
  KeyX: "b",
  Space: "a",
  Enter: "start",
  ShiftLeft: "select",
};

export function createInput(): InputSystem {
  const state: Record<Button, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    start: false,
    select: false,
  };
  const pressListeners: Partial<Record<Button, Set<() => void>>> = {};
  const releaseListeners: Partial<Record<Button, Set<() => void>>> = {};

  function set(btn: Button, down: boolean): void {
    const prev = state[btn];
    state[btn] = down;
    if (down && !prev) pressListeners[btn]?.forEach((cb) => cb());
    if (!down && prev) releaseListeners[btn]?.forEach((cb) => cb());
  }

  function onKey(e: KeyboardEvent, down: boolean): void {
    const b = DEFAULT_KEYMAP[e.code];
    if (!b) return;
    if (
      e.code === "ArrowUp" ||
      e.code === "ArrowDown" ||
      e.code === "ArrowLeft" ||
      e.code === "ArrowRight" ||
      e.code === "Space"
    ) {
      e.preventDefault();
    }
    set(b, down);
  }

  const kd = (e: KeyboardEvent) => onKey(e, true);
  const ku = (e: KeyboardEvent) => onKey(e, false);
  window.addEventListener("keydown", kd);
  window.addEventListener("keyup", ku);

  let rafId = 0;
  let destroyed = false;

  function pollGamepad(): void {
    if (destroyed) return;
    const pads = navigator.getGamepads?.();
    const gp = pads?.[0];
    if (gp) {
      set("a", gp.buttons[0]?.pressed ?? false);
      set("b", gp.buttons[1]?.pressed ?? false);
      set("start", gp.buttons[9]?.pressed ?? false);
      set("select", gp.buttons[8]?.pressed ?? false);
      set("up", (gp.buttons[12]?.pressed ?? false) || (gp.axes[1] ?? 0) < -0.5);
      set("down", (gp.buttons[13]?.pressed ?? false) || (gp.axes[1] ?? 0) > 0.5);
      set("left", (gp.buttons[14]?.pressed ?? false) || (gp.axes[0] ?? 0) < -0.5);
      set("right", (gp.buttons[15]?.pressed ?? false) || (gp.axes[0] ?? 0) > 0.5);
    }
    rafId = requestAnimationFrame(pollGamepad);
  }
  rafId = requestAnimationFrame(pollGamepad);

  return {
    isDown(btn) {
      return state[btn];
    },
    onPress(btn, cb) {
      (pressListeners[btn] ??= new Set()).add(cb);
      return () => pressListeners[btn]?.delete(cb);
    },
    onRelease(btn, cb) {
      (releaseListeners[btn] ??= new Set()).add(cb);
      return () => releaseListeners[btn]?.delete(cb);
    },
    press(btn) {
      set(btn, true);
    },
    release(btn) {
      set(btn, false);
    },
    destroy() {
      destroyed = true;
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      cancelAnimationFrame(rafId);
    },
  };
}
