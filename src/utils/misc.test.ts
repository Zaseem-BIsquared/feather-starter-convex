import { describe, expect, it, vi } from "vitest";
import { cn, callAll, getLocaleCurrency } from "./misc";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes via clsx", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges conflicting tailwind classes", () => {
    // tailwind-merge deduplicates padding
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles empty / undefined inputs", () => {
    expect(cn()).toBe("");
    expect(cn(undefined, null, "a")).toBe("a");
  });
});

describe("callAll", () => {
  it("returns a function that calls all provided functions", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const combined = callAll(fn1, fn2);
    combined("arg1", "arg2");
    expect(fn1).toHaveBeenCalledWith("arg1", "arg2");
    expect(fn2).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("skips undefined entries without throwing", () => {
    const fn1 = vi.fn();
    const combined = callAll(fn1, undefined, fn1);
    combined();
    expect(fn1).toHaveBeenCalledTimes(2);
  });

  it("works with zero functions", () => {
    const combined = callAll();
    expect(() => combined()).not.toThrow();
  });
});

describe("getLocaleCurrency", () => {
  it('returns "usd" when navigator.languages includes en-US', () => {
    vi.stubGlobal("navigator", { languages: ["en-US", "en"] });
    expect(getLocaleCurrency()).toBe("usd");
    vi.unstubAllGlobals();
  });

  it('returns "eur" when navigator.languages does not include en-US', () => {
    vi.stubGlobal("navigator", { languages: ["de-DE", "fr"] });
    expect(getLocaleCurrency()).toBe("eur");
    vi.unstubAllGlobals();
  });
});
