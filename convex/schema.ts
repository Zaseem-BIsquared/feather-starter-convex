import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v, Infer } from "convex/values";

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;
export const roleValidator = v.union(
  v.literal(ROLES.USER),
  v.literal(ROLES.ADMIN),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator),
    disabled: v.optional(v.boolean()),
  }).index("email", ["email"]),
  devEmails: defineTable({
    to: v.array(v.string()),
    subject: v.string(),
    html: v.string(),
    text: v.optional(v.string()),
    sentAt: v.number(),
  }).index("sentAt", ["sentAt"]),
});

export default schema;
