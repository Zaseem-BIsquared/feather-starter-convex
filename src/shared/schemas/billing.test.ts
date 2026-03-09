import { describe, expect, it } from "vitest";
import { currency, interval, planKey } from "./billing";

describe("currency schema", () => {
  it("parses valid currencies", () => {
    expect(currency.parse("usd")).toBe("usd");
    expect(currency.parse("eur")).toBe("eur");
  });

  it("rejects invalid currencies", () => {
    expect(() => currency.parse("gbp")).toThrow();
    expect(() => currency.parse("")).toThrow();
    expect(() => currency.parse(123)).toThrow();
  });

  it("contains exactly the expected values", () => {
    expect(currency.options).toEqual(["usd", "eur"]);
  });
});

describe("interval schema", () => {
  it("parses valid intervals", () => {
    expect(interval.parse("month")).toBe("month");
    expect(interval.parse("year")).toBe("year");
  });

  it("rejects invalid intervals", () => {
    expect(() => interval.parse("week")).toThrow();
    expect(() => interval.parse("")).toThrow();
    expect(() => interval.parse(null)).toThrow();
  });

  it("contains exactly the expected values", () => {
    expect(interval.options).toEqual(["month", "year"]);
  });
});

describe("planKey schema", () => {
  it("parses valid plan keys", () => {
    expect(planKey.parse("free")).toBe("free");
    expect(planKey.parse("pro")).toBe("pro");
  });

  it("rejects invalid plan keys", () => {
    expect(() => planKey.parse("enterprise")).toThrow();
    expect(() => planKey.parse("")).toThrow();
    expect(() => planKey.parse(undefined)).toThrow();
  });

  it("contains exactly the expected values", () => {
    expect(planKey.options).toEqual(["free", "pro"]);
  });
});
