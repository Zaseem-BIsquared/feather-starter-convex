# Codebase Concerns

**Analysis Date:** 2026-03-09

## Tech Debt

**Stripe SDK initialized with empty string fallback:**
- Issue: `convex/stripe.ts` line 27 creates a Stripe client with `STRIPE_SECRET_KEY || ""`, bypassing the env check that is commented out (lines 20-24). This means the app boots without Stripe credentials and will fail at runtime when any Stripe API call is made, with unhelpful Stripe SDK errors instead of a clear "missing config" message.
- Files: `convex/stripe.ts`
- Impact: Confusing error messages in development when Stripe keys are not configured. Silent failures possible.
- Fix approach: Uncomment the guard (lines 20-24) or implement a lazy initialization pattern that validates credentials before first use.

**Hardcoded TODO placeholders in email templates:**
- Issue: Three TODO comments indicate the OTP email sender name, subject, and template still use "Feather Starter" defaults and `onboarding@resend.dev` fallback. These need to be updated for any production deployment.
- Files: `convex/otp/ResendOTP.ts` (lines 22, 25), `convex/otp/VerificationCodeEmail.tsx` (line 28)
- Impact: Emails sent from generic/default addresses, reducing deliverability and brand trust.
- Fix approach: Pull app name from `site.config.ts` or a shared constant. Replace hardcoded sender with the `AUTH_EMAIL` env var (already partially done but falls back to default).

**Outdated Stripe API version:**
- Issue: `convex/stripe.ts` line 28 pins `apiVersion: "2024-06-20"`. This is nearly two years old.
- Files: `convex/stripe.ts`
- Impact: Missing access to newer Stripe features and potentially deprecated behavior.
- Fix approach: Update to the latest stable Stripe API version and test webhook handling against the new event shapes.

**Excessive `v8 ignore` coverage exclusion directives:**
- Issue: 27 `v8 ignore` directives across 4 files suppress coverage reporting for code branches that could be tested (form validation error rendering, conditional UI states). While some are justified (Stripe SDK calls), many mask untested UI logic.
- Files: `src/routes/_app/_auth/dashboard/_layout.settings.index.tsx` (12 occurrences), `src/routes/_app/_auth/onboarding/_layout.username.tsx` (6), `src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx` (2), `convex/stripe.ts` (7)
- Impact: False sense of 100% coverage. Bugs in ignored branches go undetected.
- Fix approach: Audit each `v8 ignore` directive. Remove those that can be covered by triggering the relevant form/UI state in tests. Keep only those for genuinely untestable external SDK calls.

**Site config has empty required fields:**
- Issue: `site.config.ts` has empty strings for `siteUrl`, `twitterHandle`, `email`, and `address`. These are consumed by components and meta tags.
- Files: `site.config.ts`
- Impact: Broken or missing metadata in production (OG tags, SEO, footer links).
- Fix approach: Either populate with real values or add build-time validation that warns when these are empty.

**Commented-out auth error display in login form:**
- Issue: The login page (`src/routes/_app/login/_layout.index.tsx` lines 111-117 and 228-234) has commented-out error display blocks for auth failures. Users currently get no feedback when authentication fails.
- Files: `src/routes/_app/login/_layout.index.tsx`
- Impact: Poor UX -- users see no error message on failed login or invalid OTP code.
- Fix approach: Uncomment and wire up the auth error state, or implement a toast/notification for auth failures.

## Security Considerations

**No username uniqueness enforcement:**
- Risk: `convex/app.ts` `updateUsername` and `completeOnboarding` mutations accept any username string and patch the user record without checking if the username is already taken by another user. The schema has no unique index on `username`.
- Files: `convex/app.ts` (lines 46-57, 59-86), `convex/schema.ts`
- Current mitigation: None. The error constant `ONBOARDING_USERNAME_ALREADY_EXISTS` exists in `errors.ts` but is never used.
- Recommendations: Add a `.index("username", ["username"])` to the users table schema and add a uniqueness check query before patching. Use the existing `ONBOARDING_USERNAME_ALREADY_EXISTS` error.

**Silent auth failures in mutations:**
- Risk: Most mutations in `convex/app.ts` silently `return` when `userId` is null (unauthenticated), instead of throwing. This means unauthenticated requests succeed with no-op behavior rather than failing explicitly.
- Files: `convex/app.ts` (lines 13-14, 24, 53, 67, 106, 117, 128, 150)
- Current mitigation: Frontend route guards redirect unauthenticated users, but the backend does not enforce auth.
- Recommendations: Throw an explicit authentication error in mutations that require auth. Only `getCurrentUser` (a query) should silently return `undefined` for unauthenticated users.

**Missing `await` on db.patch in `updateUserImage`:**
- Risk: `convex/app.ts` line 108 calls `ctx.db.patch(userId, { imageId: args.imageId })` without `await`. While Convex may handle this in its runtime, it is inconsistent with every other `ctx.db.patch` call in the codebase which uses `await`.
- Files: `convex/app.ts` (line 108)
- Current mitigation: Convex runtime likely awaits pending writes at transaction end.
- Recommendations: Add `await` for consistency and to catch any write errors.

**Upload URL generation has no file type/size validation:**
- Risk: `generateUploadUrl` in `convex/app.ts` generates an upload URL without constraining file type or size. The frontend `accept="image/*"` attribute is client-side only.
- Files: `convex/app.ts` (lines 88-97), `src/routes/_app/_auth/dashboard/_layout.settings.index.tsx` (line 114)
- Current mitigation: Client-side `accept="image/*"` on the file input.
- Recommendations: Add server-side validation of uploaded file type and size limits in the upload flow.

**Stripe webhook error handler re-throws for unhandled event types:**
- Risk: In `convex/http.ts` lines 223-234, the catch block only handles `checkout.session.completed` and `customer.subscription.updated` errors. For `customer.subscription.deleted` failures, the error is re-thrown, which returns a 500 to Stripe and triggers retries.
- Files: `convex/http.ts`
- Current mitigation: None.
- Recommendations: Add error handling for `customer.subscription.deleted` in the catch block, or implement a generic error handler for all webhook event types.

## Performance Bottlenecks

**N+1 query pattern in `getCurrentUser`:**
- Problem: `convex/app.ts` `getCurrentUser` makes 3 sequential/parallel DB calls: get user, get subscription, then get plan. Additionally calls `ctx.storage.getUrl` for avatar.
- Files: `convex/app.ts` (lines 9-43)
- Cause: No denormalization; plan data stored separately from subscription.
- Improvement path: Consider denormalizing `planKey` onto the subscription record (already done in the `User` type), or cache the plan lookup since plans rarely change.

**Checkout page uses 8-second polling timeout:**
- Problem: `_layout.checkout.tsx` uses a fixed 8-second `setTimeout` to detect checkout completion, with no actual polling of subscription status. If the Stripe webhook is slow, the user sees "Something went wrong" even though the checkout succeeded.
- Files: `src/routes/_app/_auth/dashboard/_layout.checkout.tsx` (lines 24-31)
- Cause: Reliance on Convex reactive queries to update `user.subscription.planKey` within 8 seconds.
- Improvement path: Use Convex's real-time subscription to reactively detect when `planKey` changes from `free`, instead of a fixed timeout.

## Fragile Areas

**Account deletion race condition with Stripe cancellation:**
- Files: `convex/app.ts` (lines 145-183)
- Why fragile: `deleteCurrentUserAccount` deletes the subscription record and user from the DB, then schedules `cancelCurrentUserSubscriptions` as a background action. But `cancelCurrentUserSubscriptions` calls `api.app.getCurrentUser` which queries by `auth.getUserId(ctx)` -- the user has already been deleted, so this will fail.
- Safe modification: Refactor `cancelCurrentUserSubscriptions` to accept `customerId` as an argument instead of relying on the current user context. Delete the user record *after* scheduling the cancellation, or pass the customer ID directly.
- Test coverage: Backend tests exist in `convex/app.test.ts` but the Stripe cancellation is not tested due to external SDK dependency.

**Subscription replacement (delete + insert instead of update):**
- Files: `convex/stripe.ts` (lines 170-213) `PREAUTH_replaceSubscription`
- Why fragile: The function deletes the existing subscription and inserts a new one rather than patching in place. If the insert fails after the delete, the user loses their subscription record entirely. There is no transaction rollback.
- Safe modification: Use `ctx.db.replace` or `ctx.db.patch` on the existing subscription document instead of delete + insert.
- Test coverage: Tested in `convex/stripe.test.ts` but only the happy path.

**Auth provider cleanup on account deletion is hardcoded:**
- Files: `convex/app.ts` (lines 170-181)
- Why fragile: The account deletion loops over a hardcoded array `["resend-otp", "github"]` to find and delete auth accounts. If a new auth provider is added to `convex/auth.ts`, the deletion logic must be manually updated.
- Safe modification: Query all auth accounts by `userId` without filtering by provider, so new providers are automatically cleaned up.
- Test coverage: Tested in `convex/app.test.ts`.

## Dependencies at Risk

**`@xixixao/uploadstuff` (v0.0.5):**
- Risk: Pre-1.0 package with `0.0.x` version. The `uploadstuff` library is used for file uploads and has a type declaration file with all `any` types (`src/types/uploadstuff.d.ts`). Limited community adoption and maintenance.
- Impact: Upload functionality could break on updates. The `as any` cast for `storageId` in `_layout.settings.index.tsx` line 52 indicates incomplete type safety.
- Migration plan: Consider using Convex's built-in upload APIs directly, or switch to a more established upload library.

**`oslo` (v1.2.1) for OTP generation:**
- Risk: The `oslo` package is used solely for `generateRandomString` in `convex/otp/ResendOTP.ts`. The `oslo` project was deprecated by its author (creator of Lucia auth) in favor of smaller packages.
- Impact: No security updates for crypto utilities.
- Migration plan: Replace with `@oslojs/crypto` or Node.js built-in `crypto.randomInt` for OTP generation.

## Test Coverage Gaps

**No tests for webhook handling (`convex/http.ts`):**
- What's not tested: The entire Stripe webhook handler including event parsing, subscription updates on checkout completion, subscription deletion, and error notification emails.
- Files: `convex/http.ts` (243 lines, 0% coverage)
- Risk: Webhook handling is the most critical payment flow -- subscription state changes, upgrade/downgrade logic, and error recovery are all untested.
- Priority: High

**No tests for email sending (`convex/email/`):**
- What's not tested: Email rendering, Resend API integration, error handling for failed sends.
- Files: `convex/email/index.ts`, `convex/email/templates/subscriptionEmail.tsx`
- Risk: Broken emails could go unnoticed until users report missing notifications.
- Priority: Medium

**No tests for login page or auth flow:**
- What's not tested: Email/OTP login flow, GitHub OAuth redirect, code verification, redirect after auth.
- Files: `src/routes/_app/login/_layout.index.tsx`, `src/routes/_app/_auth.tsx`
- Risk: Authentication bugs are high-impact. The commented-out error display suggests past issues.
- Priority: Medium

**Stripe SDK integration untestable without mocking:**
- What's not tested: All functions behind `v8 ignore` blocks -- `PREAUTH_createStripeCustomer`, `PREAUTH_createFreeStripeSubscription`, `createSubscriptionCheckout`, `createCustomerPortal`, `cancelCurrentUserSubscriptions`.
- Files: `convex/stripe.ts` (lines 65-90, 235-397)
- Risk: Core billing logic (customer creation, checkout, portal, cancellation) has zero test coverage.
- Priority: High

**No tests for `convex/init.ts` seeding with real Stripe:**
- What's not tested: The product/price creation flow, billing portal configuration, idempotency check.
- Files: `convex/init.ts`
- Risk: Seeding failures could leave Stripe and DB in inconsistent state.
- Priority: Low (runs once during setup)

---

*Concerns audit: 2026-03-09*
