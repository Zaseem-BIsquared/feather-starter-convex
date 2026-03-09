import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { AdminPage } from "@/features/admin";
import { UserDetail } from "@/features/admin";
import { ROLES } from "@cvx/schema";
import { useTranslation } from "react-i18next";
import siteConfig from "~/site.config";
import type { Id } from "@cvx/_generated/dataModel";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/admin")({
  component: AdminRoute,
  validateSearch: (search: Record<string, unknown>): { userId?: string } => ({
    userId: typeof search.userId === "string" ? search.userId : undefined,
  }),
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Admin`,
    headerTitle: "Admin",
    headerDescription: "Manage users and roles.",
  }),
});

function AdminRoute() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const { userId } = Route.useSearch();
  const { data: currentUser, isPending } = useQuery(
    convexQuery(api.users.queries.getCurrentUser, {}),
  );

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 py-8">
        <p className="text-sm text-primary/60">{t("loading")}</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== ROLES.ADMIN) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 py-8">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-primary">
            {t("unauthorized")}
          </p>
        </div>
      </div>
    );
  }

  if (userId) {
    return (
      <UserDetail
        userId={userId as Id<"users">}
        onBack={() => navigate({ to: "/dashboard/admin" })}
      />
    );
  }

  return <AdminPage />;
}
