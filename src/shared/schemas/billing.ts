import { z } from "zod";

/**
 * Billing-domain Zod schemas shared between frontend forms and Convex mutations.
 *
 * Values are kept in sync with convex/schema.ts (CURRENCIES, INTERVALS, PLANS).
 */

export const CURRENCY_VALUES = ["usd", "eur"] as const;
export const currency = z.enum(CURRENCY_VALUES);
export type Currency = z.infer<typeof currency>;

export const INTERVAL_VALUES = ["month", "year"] as const;
export const interval = z.enum(INTERVAL_VALUES);
export type Interval = z.infer<typeof interval>;

export const PLAN_KEY_VALUES = ["free", "pro"] as const;
export const planKey = z.enum(PLAN_KEY_VALUES);
export type PlanKey = z.infer<typeof planKey>;
