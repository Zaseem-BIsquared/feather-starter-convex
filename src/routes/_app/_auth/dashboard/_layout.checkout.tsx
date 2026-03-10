import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/features/billing";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/checkout")({
  component: CheckoutPage,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Checkout`,
  }),
});
