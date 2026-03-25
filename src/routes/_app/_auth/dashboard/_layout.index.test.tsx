import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { test } from "@cvx/test.setup";
import { renderWithRouter } from "@/test-helpers";
import { DashboardPage } from "@/features/dashboard";
import { Route } from "./_layout.index";

describe("Route.beforeLoad", () => {
  it("returns the correct context", () => {
    const context = Route.options.beforeLoad!({} as any);
    expect(context).toEqual({
      headerTitle: "Dashboard",
      headerDescription: "Manage your Apps and view your usage.",
    });
  });
});

test("renders dashboard page with get started content", async ({
  client,
}) => {
  renderWithRouter(<DashboardPage />, client);

  await waitFor(() => {
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  expect(
    screen.getByText(
      "Explore the Dashboard and get started with your first app.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByText(/go to settings/i)).toBeInTheDocument();
});
