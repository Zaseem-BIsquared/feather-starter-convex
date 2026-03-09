import { createFileRoute } from "@tanstack/react-router";
import { UsernamePage } from "@/features/onboarding";

export const Route = createFileRoute("/_app/_auth/onboarding/_layout/username")(
  {
    component: UsernamePage,
    beforeLoad: () => ({
      title: `Username`,
    }),
  },
);
