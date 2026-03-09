import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/settings/")(
  {
    component: SettingsPage,
    beforeLoad: () => ({
      title: "Settings",
      headerTitle: "Settings",
      headerDescription: "Manage your account settings.",
    }),
  },
);
