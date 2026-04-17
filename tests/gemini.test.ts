import { afterEach, describe, expect, it, vi } from "vitest";

import { calculateRetryDelay } from "../src/ai/providers/gemini.js";

describe("calculateRetryDelay", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses exponential backoff with jitter starting from the base retry delay", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    expect(calculateRetryDelay(1)).toBe(2000);
    expect(calculateRetryDelay(2)).toBe(3500);
    expect(calculateRetryDelay(3)).toBe(6500);
  });

  it("caps the delay at the maximum", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);

    expect(calculateRetryDelay(10)).toBe(10_000);
  });
});
