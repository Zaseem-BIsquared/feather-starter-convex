# External Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

**Payments - Stripe:**
- Used for subscription billing, checkout sessions, customer portal, and webhook event processing
- SDK/Client: `stripe` ^16.6.0 (Node.js SDK)
- API Version: `2024-06-20`
- Client instantiation: `convex/stripe.ts` line 27 (`new Stripe(STRIPE_SECRET_KEY)`)
- Auth: `STRIPE_SECRET_KEY` env var (Convex server-side)

**Stripe Functions:**
| Function | File | Purpose |
|----------|------|---------|
| `PREAUTH_createStripeCustomer` | `convex/stripe.ts` | Creates Stripe customer on onboarding |
| `PREAUTH_createFreeStripeSubscription` | `convex/stripe.ts` | Creates free-tier subscription for new users |
| `createSubscriptionCheckout` | `convex/stripe.ts` | Creates Stripe Checkout Session for plan upgrade |
| `createCustomerPortal` | `convex/stripe.ts` | Creates Stripe Billing Portal session |
| `cancelCurrentUserSubscriptions` | `convex/stripe.ts` | Cancels all subscriptions on account deletion |

**Stripe Webhook Handler:** `convex/http.ts`
- Endpoint: `POST /stripe/webhook`
- Auth: `STRIPE_WEBHOOK_SECRET` env var (signature verification)
- Handled events:
  - `checkout.session.completed` - Updates subscription after successful checkout
  - `customer.subscription.updated` - Syncs subscription changes (upgrade/downgrade)
  - `customer.subscription.deleted` - Removes subscription record

**Email - Resend:**
- Used for transactional email (OTP verification codes, subscription notifications)
- SDK/Client: `resend` ^6.9.3 (used for OTP in `convex/otp/ResendOTP.ts`) + direct REST API calls via `fetch` in `convex/email/index.ts`
- Auth: `AUTH_RESEND_KEY` env var
- From address: `AUTH_EMAIL` env var (fallback: `Feather Starter <onboarding@resend.dev>`)
- Email templates built with `@react-email/components` and rendered to HTML via `@react-email/render`

**Email Templates:**
| Template | File | Trigger |
|----------|------|---------|
| `VerificationCodeEmail` | `convex/otp/VerificationCodeEmail.tsx` | OTP sign-in |
| `SubscriptionSuccessEmail` | `convex/email/templates/subscriptionEmail.tsx` | Successful checkout |
| `SubscriptionErrorEmail` | `convex/email/templates/subscriptionEmail.tsx` | Failed subscription processing |

**Authentication - GitHub OAuth:**
- Provider: GitHub via `@auth/core/providers/github`
- Scope: `user:email`
- Configuration: `convex/auth.ts`
- Auth config: `convex/auth.config.ts` (domain set to `CONVEX_SITE_URL`)

**Internationalization - i18next HTTP Backend:**
- Translation files loaded from `/public/locales/{lang}/translation.json`
- Supported languages: English (`en`), Spanish (`es`)
- Configuration: `src/i18n.ts`

## Data Storage

**Database:**
- Convex (document database, built-in to Convex platform)
- Schema: `convex/schema.ts`
- Tables:
  - `users` - User profiles with optional Stripe `customerId`, indexed by `email` and `customerId`
  - `plans` - Subscription plan definitions (Free, Pro) with Stripe price IDs, indexed by `key` and `stripeId`
  - `subscriptions` - User subscription records linking to plans and Stripe, indexed by `userId` and `stripeId`
  - Auth tables (from `@convex-dev/auth`): `authAccounts`, `authSessions`, `authRefreshTokens`, `authVerificationCodes`, `authVerifiers`, `authRateLimits`
- ORM/Client: Convex built-in `ctx.db` API with typed queries/mutations

**File Storage:**
- Convex built-in file storage (`ctx.storage`)
- Used for user avatar uploads
- Upload URL generation: `convex/app.ts` (`generateUploadUrl` mutation)
- Frontend upload: `@xixixao/uploadstuff` + `react-dropzone`

**Caching:**
- Convex handles caching automatically (real-time reactive queries)
- TanStack React Query client bridges Convex subscriptions via `@convex-dev/react-query` (`ConvexQueryClient`)

## Authentication & Identity

**Auth Provider:**
- Convex Auth (`@convex-dev/auth`) wrapping Auth.js (`@auth/core`)
- Implementation: `convex/auth.ts`

**Auth Methods:**
1. Email OTP via Resend - `convex/otp/ResendOTP.ts`
   - 8-digit numeric code
   - 20-minute expiry
   - Sends verification email via Resend API
2. GitHub OAuth - `@auth/core/providers/github`
   - Scope: `user:email`

**Frontend Auth:**
- `ConvexAuthProvider` wraps the app in `src/app.tsx`
- Auth state flows through Convex reactive queries

**Account Deletion:**
- `deleteCurrentUserAccount` in `convex/app.ts` handles cleanup:
  - Deletes subscription record
  - Schedules Stripe subscription cancellation
  - Deletes user record
  - Cleans up auth accounts (resend-otp, github providers)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, etc. detected)

**Logs:**
- `console.log` / `console.error` (Convex dashboard shows server-side logs)
- Centralized error constants: `errors.ts`

## CI/CD & Deployment

**Hosting:**
- Backend: Convex Cloud (serverless functions + database)
- Frontend: Not configured (Vite builds static assets to `dist/`)

**CI Pipeline:**
- None detected (no `.github/workflows/`, no CI config files)

## Environment Configuration

**Required env vars (server-side, set in Convex dashboard):**
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
- `AUTH_RESEND_KEY` - Resend API key for email delivery
- `AUTH_EMAIL` - Sender email address (optional, has fallback)
- `SITE_URL` - Frontend URL (used for Stripe redirect URLs and email links)
- `HOST_URL` - Host URL
- `CONVEX_SITE_URL` - Convex HTTP endpoint URL (auto-set by Convex)

**Required env vars (client-side, set in `.env` or build environment):**
- `VITE_CONVEX_URL` - Convex deployment URL

**Centralized access:** All server-side env vars are exported from `convex/env.ts` -- import from there, never use `process.env` directly in other files.

**Secrets location:**
- Convex dashboard environment variables (server-side)
- No `.env` file committed to repo

## Webhooks & Callbacks

**Incoming:**
- `POST /stripe/webhook` - Stripe subscription events (`convex/http.ts`)
  - Validates signature via `stripe.webhooks.constructEventAsync`
  - Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Error handling: sends error notification email to user on failure

**Outgoing:**
- None (no outgoing webhook calls detected)

## Seed / Init

**`convex/init.ts`:**
- Runs on `predev` script (`convex dev --run init --until-success`)
- Creates Stripe products and prices if none exist
- Seeds `plans` table with Free and Pro plans
- Configures Stripe Customer Portal

---

*Integration audit: 2026-03-09*
