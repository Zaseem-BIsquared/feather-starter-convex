# Billing

## Purpose

Stripe subscription billing with free/pro plans, monthly/yearly intervals, and USD/EUR currency support. Provides a checkout page for selecting plans and a billing settings panel for viewing current subscription and managing cancellation. Handles Stripe webhook events for subscription lifecycle.

## Backend Counterpart

`convex/billing/` -- Stripe integration and billing data.

- `convex/billing/queries.ts` -- `getPlans`, `getUserSubscription` queries
- `convex/billing/stripe.ts` -- Stripe SDK calls (`createStripeCustomer`, `createStripeCheckout`, `cancelCurrentUserSubscriptions`)
- `convex/billing/actions.ts` -- Stripe webhook handler (`handleStripeWebhook`)
- `convex/http.ts` -- HTTP route mapping for `/stripe/webhook`

## Key Files

- `src/features/billing/components/CheckoutPage.tsx` -- plan selection and Stripe checkout redirect
- `src/features/billing/components/BillingSettings.tsx` -- current plan display, cancellation
- `src/features/billing/index.ts` -- barrel export (`CheckoutPage`, `BillingSettings`)
- `src/features/billing/billing.test.tsx` -- feature tests
- `src/shared/schemas/billing.ts` -- Zod schemas for currency, interval, planKey

## Dependencies

- `src/shared/schemas/billing.ts` -- shared validation schemas
- `convex/schema.ts` -- `plans` and `subscriptions` tables
- Stripe SDK (`stripe` npm package)
- `@tanstack/react-query` for data fetching

## Extension Points

- Add plan tiers by inserting rows in the `plans` table and updating `src/shared/schemas/billing.ts`
- Add payment methods beyond Stripe by creating new action files in `convex/billing/`
- Extend webhook handling in `convex/billing/actions.ts` for additional Stripe events
- The `BillingSettings` component can be extended with usage metrics or invoice history
