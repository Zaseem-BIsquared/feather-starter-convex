import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, seedPlans, seedSubscription } from "@cvx/test.setup";
import { api } from "~/convex/_generated/api";
import { renderWithRouter } from "@/test-helpers";

test("renders user info with username", async ({ client, userId }) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });
  // Patch the existing user document (created by the test fixture)
  await client.run(async (ctx: any) => {
    const user = await ctx.db.get(userId);
    await ctx.db.patch(userId, { username: "testuser123" });
  });

  const { default: DashboardSettings } = await import(
    "./_layout.settings.index"
  );
  renderWithRouter(<DashboardSettings />, client);

  await waitFor(() => {
    expect(screen.getByDisplayValue("testuser123")).toBeInTheDocument();
  });
});

test("updates username via form", async ({ client, userId }) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });
  await client.run(async (ctx: any) => {
    await ctx.db.patch(userId, { username: "oldname" });
  });

  const { default: DashboardSettings } = await import(
    "./_layout.settings.index"
  );
  renderWithRouter(<DashboardSettings />, client);

  const user = userEvent.setup();

  // Wait for the form to populate
  await waitFor(() => {
    expect(screen.getByDisplayValue("oldname")).toBeInTheDocument();
  });

  const input = screen.getByPlaceholderText("Username");
  await user.clear(input);
  await user.type(input, "newname");

  const saveButton = screen.getByRole("button", { name: /save/i });
  await user.click(saveButton);

  // Verify the backend was updated
  await waitFor(async () => {
    const updatedUser = await client.query(api.app.getCurrentUser, {});
    expect(updatedUser?.username).toBe("newname");
  });
});

test("reset button visible when avatar exists", async ({
  client,
  userId,
}) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });
  // Seed user with an external image URL (avatarUrl derives from `image` field)
  await client.run(async (ctx: any) => {
    await ctx.db.patch(userId, {
      username: "testuser",
      image: "https://example.com/avatar.png",
    });
  });

  const { default: DashboardSettings } = await import(
    "./_layout.settings.index"
  );
  renderWithRouter(<DashboardSettings />, client);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });
});

test("renders nothing when no user (unauthenticated)", async ({
  testClient,
}) => {
  await seedPlans(testClient);

  const { default: DashboardSettings } = await import(
    "./_layout.settings.index"
  );
  const { container } = renderWithRouter(<DashboardSettings />, testClient, {
    authenticated: false,
  });

  // Component returns null when no user, so the main wrapper div should not appear
  await waitFor(
    () => {
      expect(container.querySelector(".flex.h-full.w-full")).toBeNull();
    },
    { timeout: 2000 },
  );
});
