import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("math still works", () => {
    expect(1 + 1).toBe(2);
  });

  it("array spread works", () => {
    const a = [1, 2];
    const b = [...a, 3];
    expect(b).toEqual([1, 2, 3]);
  });
});
