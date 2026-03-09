import { createFileRoute } from "@tanstack/react-router";
import { BillingSettings } from "@/features/billing";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "~/convex/_generated/api";

export const Route = createFileRoute(
  "/_app/_auth/dashboard/_layout/settings/billing",
)({
  component: BillingSettings,
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.billing.queries.getActivePlans, {}),
    );
    return {
      title: "Billing",
      headerTitle: "Billing",
      headerDescription: "Manage billing and your subscription plan.",
    };
  },
});
