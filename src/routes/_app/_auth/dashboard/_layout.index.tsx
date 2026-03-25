import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: `${siteConfig.siteTitle} - Dashboard` }],
  }),
  beforeLoad: () => ({
    headerTitle: "Dashboard",
    headerDescription: "Manage your Apps and view your usage.",
  }),
});
