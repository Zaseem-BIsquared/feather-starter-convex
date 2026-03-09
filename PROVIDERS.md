# Providers

Every external vendor/service used by Feather Starter Kit, with swap guides.

## Convex

**What it does:** Backend-as-a-service providing database, real-time subscriptions, server functions (queries/mutations/actions), file storage, scheduled jobs, and authentication via `@convex-dev/auth`.

**Files that use it:**
- `convex/` -- all backend logic
- `src/` -- any file importing `api` from `~/convex/_generated/api`
- `convex/schema.ts` -- database schema
- `convex/auth.ts`, `convex/auth.config.ts` -- authentication setup

**Env vars:**
- `CONVEX_DEPLOYMENT` -- deployment identifier
- `VITE_CONVEX_URL` -- public Convex URL for the frontend

**Swap guide:**
Convex is deeply integrated. Swapping it requires replacing:
1. All `convex/` server functions with your new backend (REST, tRPC, etc.)
2. `@convex-dev/react-query` hooks with standard fetch/query patterns
3. `convex/schema.ts` with your ORM schema (Prisma, Drizzle, etc.)
4. `@convex-dev/auth` with your auth library (NextAuth, Lucia, etc.)
5. File storage (`ctx.storage`) with S3/Cloudflare R2
6. Scheduled jobs (`ctx.scheduler`) with a job queue (BullMQ, Inngest, etc.)

---

## Resend

**What it does:** Transactional email delivery. Sends OTP verification codes during authentication.

**Files that use it:**
- `convex/otp/ResendOTP.ts` -- OTP email sender using Resend API
- `convex/email/index.ts` -- email rendering with `@react-email/components`

**Env vars:**
- `RESEND_API_KEY` -- Resend API key (set in Convex dashboard)

**Swap guide:**
1. Replace `convex/otp/ResendOTP.ts` with your email provider's SDK (SendGrid, Postmark, AWS SES)
2. Update the `send()` call to use your provider's API
3. Keep `convex/email/index.ts` -- it renders React Email templates (provider-agnostic)
4. Update env var name if different

---

## Stripe

**What it does:** Payment processing, subscription billing, webhook handling for plan changes.

**Files that use it:**
- `convex/billing/stripe.ts` -- Stripe SDK calls (create customer, create checkout, manage subscriptions)
- `convex/billing/actions.ts` -- webhook handler for Stripe events
- `convex/billing/queries.ts` -- plan/subscription queries
- `convex/http.ts` -- HTTP route for Stripe webhook endpoint
- `src/features/billing/` -- checkout and billing settings UI

**Env vars:**
- `STRIPE_SECRET_KEY` -- Stripe secret key (set in Convex dashboard)
- `STRIPE_WEBHOOK_SECRET` -- webhook signing secret (set in Convex dashboard)

**Swap guide:**
1. Replace `convex/billing/stripe.ts` with your payment provider's SDK (Paddle, Lemon Squeezy, etc.)
2. Update `convex/billing/actions.ts` webhook handler for your provider's event format
3. Update `convex/http.ts` webhook route if endpoint changes
4. Keep `convex/schema.ts` tables (`plans`, `subscriptions`) -- adjust fields as needed
5. Update `src/features/billing/` components for your provider's checkout flow
6. Update env vars

---

## GitHub OAuth

**What it does:** Social login via GitHub. Configured through `@convex-dev/auth`.

**Files that use it:**
- `convex/auth.config.ts` -- OAuth provider configuration
- `convex/auth.ts` -- auth setup with `@convex-dev/auth`

**Env vars:**
- `AUTH_GITHUB_ID` -- GitHub OAuth app client ID (set in Convex dashboard)
- `AUTH_GITHUB_SECRET` -- GitHub OAuth app client secret (set in Convex dashboard)

**Swap guide:**
1. Update `convex/auth.config.ts` to add/replace with your OAuth provider (Google, Discord, etc.)
2. `@convex-dev/auth` supports multiple providers -- see [Convex Auth docs](https://labs.convex.dev/auth)
3. Update env vars for your new provider
4. No frontend changes needed -- the auth flow is provider-agnostic

---

## Vercel (Hosting)

**What it does:** Frontend hosting with automatic deployments from Git.

**Files that use it:**
- No code files directly reference Vercel
- Build command: `npm run build`
- Output: `dist/`

**Swap guide:**
1. Any static hosting works (Netlify, Cloudflare Pages, AWS Amplify)
2. Set build command to `npm run build` and output directory to `dist/`
3. Set `VITE_CONVEX_URL` environment variable in your hosting provider
