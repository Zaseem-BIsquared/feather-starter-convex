import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { cn } from "@/utils/misc";
import { buttonVariants } from "@/ui/button-util";
import { Shield, ShieldAlert } from "lucide-react";

export function AdminPage() {
  const { t } = useTranslation("admin");
  const { data: users, isPending } = useQuery(
    convexQuery(api.admin.queries.listUsers, {}),
  );

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 py-8">
        <p className="text-sm text-primary/60">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full px-6 py-8">
      <div className="mx-auto flex h-full w-full max-w-screen-xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium text-primary">{t("title")}</h2>
          <p className="text-sm font-normal text-primary/60">
            {t("description")}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary/60">
                  {t("table.user")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary/60">
                  {t("table.email")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary/60">
                  {t("table.role")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary/60">
                  {t("table.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary/60">
                  {t("table.joined")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-primary/60">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.username ?? user.email ?? ""}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                        )}
                        <span className="text-sm font-medium text-primary">
                          {user.username || user.name || "No username"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/60">
                      {user.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          user.role === "admin"
                            ? "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:text-amber-300"
                            : "bg-primary/5 text-primary/60 ring-1 ring-inset ring-primary/10",
                        )}
                      >
                        {user.role === "admin" ? (
                          <ShieldAlert className="h-3 w-3" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        {t(`roles.${user.role}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          user.disabled
                            ? "bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-600/20 dark:text-red-300"
                            : "bg-green-500/10 text-green-700 ring-1 ring-inset ring-green-600/20 dark:text-green-300",
                        )}
                      >
                        {user.disabled
                          ? t("detail.disabled")
                          : t("detail.enabled")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/60">
                      {new Date(user._creationTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/dashboard/admin"
                        search={{ userId: user._id }}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-7 text-xs",
                        )}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-primary/60"
                  >
                    {t("noUsers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
