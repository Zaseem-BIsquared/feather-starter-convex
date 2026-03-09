# Architecture

**Analysis Date:** 2026-03-09

## Pattern Overview

**Overall:** Client-server SPA with Convex BaaS (Backend-as-a-Service)

**Key Characteristics:**
- React SPA frontend with file-based routing (TanStack Router)
- Convex serverless backend with real-time queries, mutations, and actions
- Convex handles database, auth, file storage, and scheduling -- no separate API server
- React Query bridged to Convex via `@convex-dev/react-query` for data fetching
- Stripe integration for subscription billing handled via Convex HTTP actions (webhooks) and Convex actions (checkout/portal)

## Layers

**Presentation (Frontend):**
- Purpose: React components, routing, forms, UI
- Location: `src/`
- Contains: Route components, UI primitives, utilities, i18n config
- Depends on: Convex client SDK, TanStack Router, TanStack React Query, TanStack React Form, Radix UI
- Used by: Browser

**Backend Functions (Convex):**
- Purpose: Server-side logic -- queries, mutations, actions, HTTP endpoints
- Location: `convex/`
- Contains: Database schema, query/mutation/action definitions, auth config, email sending, Stripe integration
- Depends on: Convex runtime, Stripe SDK, Resend API, `@convex-dev/auth`
- Used by: Frontend (via Convex client), Stripe webhooks (via HTTP routes)

**Shared Types & Config:**
- Purpose: Types and constants shared between frontend and backend
- Location: Root-level `types.ts`, `errors.ts`, `site.config.ts`
- Contains: `User` type definition, error constants, site metadata
- Depends on: Convex generated types (`~/convex/_generated/dataModel`)
- Used by: Both `src/` and `convex/`

## Data Flow

**User Authentication (OTP):**

1. User submits email on login page (`src/routes/_app/login/_layout.index.tsx`)
2. `signIn("resend-otp", { email })` triggers Convex auth flow via `@convex-dev/auth`
3. Convex auth calls `ResendOTP` provider (`convex/otp/ResendOTP.ts`) which sends OTP email via Resend API
4. User submits OTP code, `signIn("resend-otp", { email, code })` verifies
5. On success, `ConvexAuthProvider` updates auth state, user redirected to onboarding or dashboard

**User Authentication (GitHub OAuth):**

1. User clicks "Continue with Github" on login page
2. `signIn("github", { redirectTo: "/login" })` triggers OAuth flow
3. GitHub provider configured in `convex/auth.ts` handles the OAuth callback
4. User redirected back to `/login`, auth state updated by `ConvexAuthProvider`

**Data Queries (Real-time):**

1. Route component calls `useQuery(convexQuery(api.app.getCurrentUser, {}))`
2. `ConvexQueryClient` bridges Convex's real-time subscriptions to React Query
3. Convex query function in `convex/app.ts` runs server-side, reads from DB
4. Results stream to client in real-time; React Query cache auto-updates

**Stripe Subscription Checkout:**

1. User selects plan on billing page (`src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx`)
2. Frontend calls `createSubscriptionCheckout` action (`convex/stripe.ts`)
3. Action creates Stripe Checkout Session server-side, returns URL
4. Frontend redirects browser to Stripe-hosted checkout page
5. After payment, Stripe sends webhook to `/stripe/webhook` (`convex/http.ts`)
6. Webhook handler processes `checkout.session.completed` event, updates DB subscription
7. User redirected to `/dashboard/checkout` which polls until subscription updates

**Onboarding Flow:**

1. After first login, user has no `username` -- login page redirects to `/onboarding/username`
2. User submits username form, calls `completeOnboarding` mutation (`convex/app.ts`)
3. Mutation sets username and schedules `PREAUTH_createStripeCustomer` action
4. Action creates Stripe customer, then creates free subscription, then stores `customerId`
5. User redirected to `/dashboard`

**State Management:**
- Server state: Convex real-time queries via React Query (no separate state store)
- Auth state: `ConvexAuthProvider` wraps app, provides `useConvexAuth()` hook
- Local UI state: React `useState` within components (form state, loading spinners)
- Form state: TanStack Form (`useForm`) for structured form handling with validation
- No global client-side state management library (no Redux, Zustand, etc.)

## Key Abstractions

**Convex Functions (query/mutation/action):**
- Purpose: Server-side logic units with typed arguments and returns
- Examples: `convex/app.ts` (queries/mutations), `convex/stripe.ts` (actions)
- Pattern: `query({ args: { ... }, handler: async (ctx, args) => { ... } })` -- Convex validates args automatically using `v.*` validators

**PREAUTH/UNAUTH Internal Functions:**
- Purpose: Scheduled or internal functions that run without a current authenticated user
- Examples: `PREAUTH_createStripeCustomer`, `PREAUTH_replaceSubscription`, `UNAUTH_getDefaultPlan` in `convex/stripe.ts`
- Pattern: Prefixed with `PREAUTH_` (user ID passed in, caller must authorize first) or `UNAUTH_` (no auth needed). All use `internalMutation`/`internalAction`/`internalQuery`.

**Route Layouts (TanStack Router):**
- Purpose: Nested layout components that compose the page hierarchy
- Examples: `src/routes/_app.tsx` (app wrapper), `src/routes/_app/_auth.tsx` (auth guard), `src/routes/_app/_auth/dashboard/_layout.tsx` (dashboard shell)
- Pattern: Pathless layout routes use `_` prefix. `beforeLoad` hooks prefetch data or set route context (title, header).

**Email Templates:**
- Purpose: React-rendered HTML emails sent via Resend
- Examples: `convex/email/templates/subscriptionEmail.tsx`, `convex/otp/VerificationCodeEmail.tsx`
- Pattern: React Email components rendered to HTML string, sent through `sendEmail()` helper in `convex/email/index.ts`

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html` which references this file
- Responsibilities: Renders React root with `<App />` component

**App Bootstrap:**
- Location: `src/app.tsx`
- Triggers: Rendered by `main.tsx`
- Responsibilities: Sets up provider hierarchy: `HelmetProvider` > `ConvexAuthProvider` > `QueryClientProvider` > `RouterProvider`. Creates Convex client, React Query client with Convex bridge.

**Router:**
- Location: `src/router.tsx` + `src/routeTree.gen.ts` (auto-generated)
- Triggers: `RouterProvider` renders the active route
- Responsibilities: File-based routing via TanStack Router plugin. Route tree auto-generated from `src/routes/` directory.

**Convex HTTP Router:**
- Location: `convex/http.ts`
- Triggers: External HTTP requests to Convex deployment
- Responsibilities: Stripe webhook handler at `/stripe/webhook`, auth HTTP routes (OAuth callbacks via `auth.addHttpRoutes(http)`)

**Convex Init Script:**
- Location: `convex/init.ts`
- Triggers: `npm run predev` runs `convex dev --run init --until-success`
- Responsibilities: Seeds Stripe products/prices and Convex `plans` table on first run. Skips if products already exist.

## Error Handling

**Strategy:** Centralized error constants with throw-based error handling

**Patterns:**
- All error messages defined in `errors.ts` as `ERRORS` const object, imported by both frontend and backend
- Backend functions throw `new Error(ERRORS.*)` on failures -- Convex propagates these to the client
- Stripe webhook handler has try/catch per event type; error cases send error notification emails to user and re-throw
- Frontend silently returns `null` rendering when data is not yet loaded (`if (!user) return null`)
- Zod validation used inline for Stripe webhook payloads (`z.object().parse()`) and form validation

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.error` only -- no structured logging framework. Backend logs appear in Convex dashboard.

**Validation:**
- Backend: Convex validators (`v.string()`, `v.id()`, etc.) on all query/mutation args provide automatic runtime validation
- Frontend forms: TanStack Form with Zod validators (`src/utils/validators.ts` for username, inline `z.string().email()` for email)
- Stripe webhook payloads: Zod `.parse()` for extracting required fields

**Authentication:**
- `@convex-dev/auth` handles auth state and session management
- Backend: `auth.getUserId(ctx)` in every query/mutation handler to get current user
- Frontend: `useConvexAuth()` hook provides `isAuthenticated`/`isLoading`
- Auth guard: `src/routes/_app/_auth.tsx` layout redirects unauthenticated users to `/login`
- Data prefetch guard: `src/routes/_app.tsx` uses `beforeLoad` to ensure user data is loaded before rendering

**Internationalization:**
- i18next configured in `src/i18n.ts` with HTTP backend loading from `public/locales/{lang}/translation.json`
- Language detection via `i18next-browser-languagedetector`
- Supported languages: English (`en`), Spanish (`es`)
- Used in dashboard page via `useTranslation()` hook

---

*Architecture analysis: 2026-03-09*
