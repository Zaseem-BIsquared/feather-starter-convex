import { screen, waitFor } from "@testing-library/react";
import { test, seedPlans, seedSubscription } from "@cvx/test.setup";
import { renderWithRouter } from "@/test-helpers";

test("pro subscription shows checkout completed", async ({
  client,
  userId,
}) => {
  const { proPlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: proPlanId });

  const { default: DashboardCheckout } = await import("./_layout.checkout");
  renderWithRouter(<DashboardCheckout />, client);

  await waitFor(() => {
    expect(screen.getByText("Checkout completed!")).toBeInTheDocument();
  });
});

test("free subscription shows error after timeout", async ({
  client,
  userId,
}) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });

  vi.useFakeTimers({ shouldAdvanceTime: true });

  const { default: DashboardCheckout } = await import("./_layout.checkout");
  renderWithRouter(<DashboardCheckout />, client);

  // Initially shows loading state
  await waitFor(() => {
    expect(
      screen.getByText("Completing your checkout ..."),
    ).toBeInTheDocument();
  });

  // Advance past the 8-second timeout
  await vi.advanceTimersByTimeAsync(8500);

  await waitFor(() => {
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  vi.useRealTimers();
});

test("renders nothing when unauthenticated", async ({ testClient }) => {
  await seedPlans(testClient);

  const { default: DashboardCheckout } = await import("./_layout.checkout");
  const { container } = renderWithRouter(<DashboardCheckout />, testClient, {
    authenticated: false,
  });

  // Component returns null when no user
  await waitFor(
    () => {
      expect(container.querySelector(".flex.h-full.w-full")).toBeNull();
    },
    { timeout: 2000 },
  );
});
