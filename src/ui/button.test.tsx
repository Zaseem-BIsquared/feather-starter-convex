import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders as a <button> by default", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn.tagName).toBe("BUTTON");
  });

  it("renders as a Slot (child element) when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/test");
    // Should have the button variant classes applied via Slot
    expect(link.className).toContain("inline-flex");
  });
});
