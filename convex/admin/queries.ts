import { query } from "@cvx/_generated/server";
import { v } from "convex/values";
import { auth } from "@cvx/auth";
import { ERRORS } from "~/errors";
import { ROLES } from "@cvx/schema";

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

export const listUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 50;
    const users = await ctx.db.query("users").take(limit);
    return users.map((user: any) => ({
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role ?? ROLES.USER,
      disabled: user.disabled ?? false,
      image: user.image,
    }));
  },
});

export const getUserDetail = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error(ERRORS.admin.USER_NOT_FOUND);
    }
    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role ?? ROLES.USER,
      disabled: user.disabled ?? false,
      image: user.image,
    };
  },
});
