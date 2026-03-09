import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/button";
import { cn } from "@/utils/misc";
import { ArrowLeft, Shield, ShieldAlert } from "lucide-react";
import { ROLES } from "@cvx/schema";
import type { Id } from "@cvx/_generated/dataModel";

interface UserDetailProps {
  userId: Id<"users">;
  onBack: () => void;
}

export function UserDetail({ userId, onBack }: UserDetailProps) {
  const { t } = useTranslation("admin");
  const { data: user, isPending } = useQuery(
    convexQuery(api.admin.queries.getUserDetail, { userId }),
  );

  const { mutate: updateRole } = useMutation({
    mutationFn: useConvexMutation(api.admin.mutations.updateUserRole),
  });

  const { mutate: toggleDisabled } = useMutation({
    mutationFn: useConvexMutation(api.admin.mutations.toggleUserDisabled),
  });

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 py-8">
        <p className="text-sm text-primary/60">{t("loading")}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-full w-full px-6 py-8">
      <div className="mx-auto flex h-full w-full max-w-screen-xl flex-col gap-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-primary/60 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("detail.back")}
        </button>

        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.username ?? user.email ?? ""}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="h-16 w-16 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
            )}
            <div>
              <h3 className="text-lg font-medium text-primary">
                {user.username || user.name || "No username"}
              </h3>
              <p className="text-sm text-primary/60">{user.email || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Role */}
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-primary/40">
                {t("detail.role")}
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium",
                    user.role === "admin"
                      ? "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:text-amber-300"
                      : "bg-primary/5 text-primary/60 ring-1 ring-inset ring-primary/10",
                  )}
                >
                  {user.role === "admin" ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  ) : (
                    <Shield className="h-3.5 w-3.5" />
                  )}
                  {t(`roles.${user.role}`)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateRole({
                      userId: user._id,
                      role:
                        user.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN,
                    })
                  }
                  className="h-7 text-xs"
                >
                  {user.role === ROLES.ADMIN
                    ? `Set ${t("roles.user")}`
                    : `Set ${t("roles.admin")}`}
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-primary/40">
                {t("detail.status")}
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-sm font-medium",
                    user.disabled
                      ? "bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-600/20 dark:text-red-300"
                      : "bg-green-500/10 text-green-700 ring-1 ring-inset ring-green-600/20 dark:text-green-300",
                  )}
                >
                  {user.disabled ? t("detail.disabled") : t("detail.enabled")}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toggleDisabled({
                      userId: user._id,
                      disabled: !user.disabled,
                    })
                  }
                  className="h-7 text-xs"
                >
                  {user.disabled ? t("detail.enable") : t("detail.disable")}
                </Button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-primary/40">
                {t("detail.email")}
              </label>
              <p className="text-sm text-primary">{user.email || "-"}</p>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-primary/40">
                {t("detail.username")}
              </label>
              <p className="text-sm text-primary">{user.username || "-"}</p>
            </div>

            {/* Joined */}
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <label className="text-xs font-medium uppercase tracking-wider text-primary/40">
                {t("detail.joined")}
              </label>
              <p className="text-sm text-primary">
                {new Date(user._creationTime).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
