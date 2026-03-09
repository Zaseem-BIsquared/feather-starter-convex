import { mutation } from "@cvx/_generated/server";
import { v } from "convex/values";
import { auth } from "@cvx/auth";
import { ERRORS } from "~/errors";
import { ROLES, roleValidator } from "@cvx/schema";

async function requireAdmin(ctx: { db: any; auth: any }) {
  const userId = await auth.getUserId(ctx as any);
  if (!userId) {
    throw new Error(ERRORS.admin.UNAUTHORIZED);
  }
  const user = await ctx.db.get(userId);
  if (!user || user.role !== ROLES.ADMIN) {
    throw new Error(ERRORS.admin.UNAUTHORIZED);
  }
  return user;
}

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin._id === args.userId) {
      throw new Error(ERRORS.admin.CANNOT_MODIFY_SELF);
    }
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error(ERRORS.admin.USER_NOT_FOUND);
    }
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const toggleUserDisabled = mutation({
  args: {
    userId: v.id("users"),
    disabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (admin._id === args.userId) {
      throw new Error(ERRORS.admin.CANNOT_MODIFY_SELF);
    }
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error(ERRORS.admin.USER_NOT_FOUND);
    }
    await ctx.db.patch(args.userId, { disabled: args.disabled });
  },
});
