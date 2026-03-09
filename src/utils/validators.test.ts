import { describe, expect, it } from "vitest";
import { username } from "./validators";

describe("username validator", () => {
  it("accepts valid alphanumeric usernames", () => {
    expect(username.parse("alice")).toBe("alice");
    expect(username.parse("Bob123")).toBe("bob123"); // lowercased
  });

  it("trims whitespace", () => {
    expect(username.parse("  alice  ")).toBe("alice");
  });

  it("lowercases input", () => {
    expect(username.parse("ALICE")).toBe("alice");
  });

  it("rejects usernames shorter than 3 characters", () => {
    expect(() => username.parse("ab")).toThrow();
  });

  it("rejects usernames longer than 20 characters", () => {
    expect(() => username.parse("a".repeat(21))).toThrow();
  });

  it("rejects non-alphanumeric characters", () => {
    expect(() => username.parse("alice!")).toThrow();
    expect(() => username.parse("alice bob")).toThrow();
    expect(() => username.parse("alice-bob")).toThrow();
    expect(() => username.parse("alice_bob")).toThrow();
  });

  it("accepts exactly 3 and 20 character usernames", () => {
    expect(username.parse("abc")).toBe("abc");
    expect(username.parse("a".repeat(20))).toBe("a".repeat(20));
  });
});
