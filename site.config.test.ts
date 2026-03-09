import { describe, expect, it } from "vitest";
import siteConfig from "./site.config";

describe("site.config", () => {
  it("exports a configuration object with required fields", () => {
    expect(siteConfig).toBeDefined();
    expect(siteConfig.siteTitle).toBe("Feather Starter");
    expect(typeof siteConfig.siteDescription).toBe("string");
    expect(siteConfig).toHaveProperty("siteUrl");
    expect(siteConfig).toHaveProperty("siteImage");
    expect(siteConfig).toHaveProperty("favicon");
    expect(siteConfig).toHaveProperty("twitterHandle");
    expect(siteConfig).toHaveProperty("email");
    expect(siteConfig).toHaveProperty("address");
  });
});
