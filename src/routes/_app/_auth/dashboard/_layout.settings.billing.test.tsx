import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, seedPlans, seedSubscription } from "@cvx/test.setup";
import { renderWithRouter } from "@/test-helpers";

test("renders current plan badge as Free", async ({ client, userId }) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });

  const { default: BillingSettings } = await import(
    "./_layout.settings.billing"
  );
  renderWithRouter(<BillingSettings />, client);

  await waitFor(() => {
    expect(screen.getByText(/you are currently on the/i)).toBeInTheDocument();
  });

  // The plan badge shows the capitalized plan key
  const badge = screen.getByText((_content, element) => {
    return (
      element?.tagName === "SPAN" &&
      element?.className.includes("bg-primary/10") &&
      element?.textContent === "Free"
    );
  });
  expect(badge).toBeInTheDocument();
});

test("shows both plan cards with Upgrade button for free user", async ({
  client,
  userId,
}) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });

  const { default: BillingSettings } = await import(
    "./_layout.settings.billing"
  );
  renderWithRouter(<BillingSettings />, client);

  await waitFor(() => {
    expect(screen.getByText(/you are currently on the/i)).toBeInTheDocument();
  });

  // Both plan cards are shown (Free and Pro plan names)
  const planNames = screen.getAllByText(
    (_content, element) =>
      element?.tagName === "SPAN" &&
      element?.className.includes("text-base font-medium") === true,
  );
  expect(planNames).toHaveLength(2);
  expect(planNames[0]).toHaveTextContent("Free");
  expect(planNames[1]).toHaveTextContent("Pro");

  expect(
    screen.getByRole("button", { name: /upgrade to pro/i }),
  ).toBeInTheDocument();
});

test("upgrade button disabled when free plan selected", async ({
  client,
  userId,
}) => {
  const { freePlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: freePlanId });

  const { default: BillingSettings } = await import(
    "./_layout.settings.billing"
  );
  renderWithRouter(<BillingSettings />, client);

  const user = userEvent.setup();

  // Wait for the plan cards to load
  await waitFor(() => {
    expect(screen.getByText(/you are currently on the/i)).toBeInTheDocument();
  });

  // selectedPlanId starts as undefined (query is async). Click the Free plan card
  // to set selectedPlanId = freePlanId, which disables the button.
  const freeCard = screen.getByText("Free plan").closest('[role="button"]')!;
  await user.click(freeCard);

  expect(
    screen.getByRole("button", { name: /upgrade to pro/i }),
  ).toBeDisabled();
});

test("shows renewal info for paid plan", async ({ client, userId }) => {
  const { proPlanId } = await seedPlans(client);
  await seedSubscription(client, { userId, planId: proPlanId });

  const { default: BillingSettings } = await import(
    "./_layout.settings.billing"
  );
  renderWithRouter(<BillingSettings />, client);

  await waitFor(() => {
    expect(screen.getByText(/renews/i)).toBeInTheDocument();
  });

  // Verify the date is rendered (currentPeriodEnd = 2000000 seconds → Jan 24, 1970)
  const renewalText = screen.getByText(/renews/i).closest("p");
  expect(renewalText?.textContent).toContain("1970");
});
