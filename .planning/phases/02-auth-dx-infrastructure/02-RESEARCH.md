# Phase 2: Auth & DX Infrastructure - Research

**Researched:** 2026-03-10
**Domain:** Convex Auth (Password provider), Dev Tooling (Lefthook, Playwright)
**Confidence:** HIGH

## Summary

This phase adds email/password authentication alongside existing OTP and GitHub OAuth, implements password reset via email, creates a dev-only email viewer route, sets up Lefthook pre-commit hooks enforcing 100% test coverage, and adds Playwright E2E tests covering all user-facing flows.

The project is well-positioned for this work. `@convex-dev/auth` already supports a `Password` provider with built-in password reset flows. The existing `ResendOTP` provider pattern provides a template for the password reset email provider. The `feather-testing-convex` and `feather-testing-core` packages already have Playwright integration (`feather-testing-convex/playwright`) with a fluent Session DSL, making E2E test authoring straightforward. Vitest is already configured with 100% coverage thresholds -- Lefthook just needs to enforce running tests on every commit.

**Primary recommendation:** Use `@convex-dev/auth`'s `Password` provider with `reset` option for auth, intercept emails in dev via a Convex table + dev route, use Lefthook for pre-commit hooks, and use `feather-testing-convex/playwright` for E2E tests against a dedicated Convex deployment.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- E2E tests cover auth flows (sign up, sign in, password reset, sign out) AND existing flows (onboarding, profile settings, billing) -- not just minimum auth round-trip
- Separate Convex deployment dedicated to E2E tests (isolated from dev data)
- No CI integration for now -- Playwright runs locally during development

### Claude's Discretion
- Login page layout -- how email/password form coexists with OTP and GitHub OAuth
- Dev mailbox design -- storage approach, route location, email display format, HTML preview
- Password reset flow -- page structure, token expiry, success/error feedback
- Pre-commit hook configuration -- Lefthook setup, coverage thresholds, what runs on commit
- E2E auth handling -- real login flow vs programmatic helper

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up and sign in with email + password | `Password` provider from `@convex-dev/auth/providers/Password` -- flows via `signIn("password", formData)` with `flow` field for signUp/signIn |
| AUTH-02 | User can reset password via email link | `Password({ reset: ResendOTPPasswordReset })` config -- uses `flow: "reset"` and `flow: "reset-verification"` |
| DX-01 | Dev mailbox captures all emails, viewable at dev route | Intercept `sendEmail()` calls to store in Convex `devEmails` table; TanStack Router dev-only route |
| DX-02 | Lefthook pre-commit hook enforces 100% test coverage | `lefthook` npm package + `lefthook.yml` config running `vitest run --coverage` |
| DX-03 | Playwright E2E tests cover all user-facing flows | `feather-testing-convex/playwright` with `createConvexTest()` fixture + Session DSL |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@convex-dev/auth` | ^0.0.91 | Password provider, password reset | Already installed; official Convex auth solution with built-in Password provider |
| `@playwright/test` | latest | E2E browser testing | Industry standard; fluent API; built-in auto-waiting |
| `lefthook` | latest | Git hooks manager | Fast (Go binary), parallel commands, simple YAML config |
| `feather-testing-convex` | ^0.5.0 | Playwright Convex integration | Already installed; provides `createConvexTest()` with session fixture + auto-cleanup |
| `feather-testing-core` | latest | Session DSL for Playwright | Already installed (peer of feather-testing-convex); fluent `visit().fillIn().clickButton()` API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@oslojs/crypto` | (installed) | Random token generation | Password reset OTP code generation (newer API than `oslo/crypto`) |
| `resend` | ^6.9.3 | Email sending API | Already installed; used by reset email provider |
| `@react-email/components` | ^1.0.8 | Email templates | Already installed; for password reset email template |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lefthook | Husky + lint-staged | Husky requires Node, Lefthook is Go binary (faster); Lefthook has simpler config |
| Dev email table in Convex | Ethereal/Mailhog | External service dependency; Convex table is zero-config and inspectable via dev route |
| `@oslojs/crypto` | `oslo/crypto` | Both installed; `@oslojs/crypto` is the newer package (oslo v2) -- Convex Auth docs now show `@oslojs/crypto`. Either works since both are already installed |

**Installation:**
```bash
npm install -D lefthook @playwright/test
npx playwright install chromium
npx lefthook install
```

## Architecture Patterns

### Recommended Project Structure
```
convex/
  auth.ts                    # Add Password provider with reset option
  password/
    ResendOTPPasswordReset.ts  # Reset email provider (follows ResendOTP pattern)
    PasswordResetEmail.tsx     # React Email template for reset code
  email/
    index.ts                 # Modify sendEmail() to intercept in dev
  devEmails/
    schema.ts                # devEmails table definition (or inline in schema.ts)
    queries.ts               # listDevEmails query
    mutations.ts             # storeDevEmail, clearDevEmails mutations
  testing/
    clearAll.ts              # Mutation to clear E2E test data
src/
  features/auth/
    components/
      PasswordForm.tsx       # Email/password sign-up/sign-in form
      PasswordResetForm.tsx  # Password reset flow (request code + verify)
  routes/
    _app/
      login/_layout.index.tsx  # Modify to include password form
      dev/
        mailbox.tsx           # Dev-only email viewer route
e2e/
  fixtures.ts               # createConvexTest() setup
  auth.spec.ts              # Auth flow tests
  onboarding.spec.ts        # Existing flow tests
  settings.spec.ts          # Settings/billing tests
lefthook.yml                # Pre-commit hook config
playwright.config.ts        # Playwright configuration
```

### Pattern 1: Password Provider Registration
**What:** Add `Password` provider to existing `convexAuth()` config with reset capability
**When to use:** Always -- this is the standard Convex Auth pattern
**Example:**
```typescript
// Source: https://labs.convex.dev/auth/config/passwords
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { ResendOTP } from "./otp/ResendOTP";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTPPasswordReset } from "./password/ResendOTPPasswordReset";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    ResendOTP,
    GitHub({
      authorization: { params: { scope: "user:email" } },
    }),
    Password({ reset: ResendOTPPasswordReset }),
  ],
});
```

### Pattern 2: Password Reset Email Provider
**What:** Configure an Auth.js email provider for sending reset codes
**When to use:** When the Password provider needs `reset` functionality
**Example:**
```typescript
// Source: https://labs.convex.dev/auth/config/passwords
// convex/password/ResendOTPPasswordReset.ts
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",  // Must match the existing OTP provider ID if sharing
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) { crypto.getRandomValues(bytes); },
    };
    return generateRandomString(random, "0123456789", 8);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Feather Starter <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your password",
      text: "Your password reset code is " + token,
    });
    if (error) throw new Error("Could not send reset email");
  },
});
```

### Pattern 3: Client-Side Password Auth Flow
**What:** Form with hidden `flow` field controlling signUp vs signIn
**When to use:** Login page with email/password
**Example:**
```typescript
// Source: https://labs.convex.dev/auth/config/passwords
const { signIn } = useAuthActions();
// Sign up
void signIn("password", { email, password, flow: "signUp" });
// Sign in
void signIn("password", { email, password, flow: "signIn" });
// Request reset
void signIn("password", { email, flow: "reset" });
// Verify reset
void signIn("password", { email, code, newPassword, flow: "reset-verification" });
```

### Pattern 4: Dev Email Interception
**What:** Wrap `sendEmail()` to also store emails in a Convex table during development
**When to use:** DX-01 dev mailbox requirement
**Example:**
```typescript
// convex/email/index.ts - add dev interception
export async function sendEmail(ctx: ActionCtx, options: SendEmailOptions) {
  // Always store in dev emails table (or gate on NODE_ENV)
  await ctx.runMutation(internal.devEmails.mutations.store, {
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    sentAt: Date.now(),
  });
  // In production, also send via Resend
  // ... existing Resend send logic
}
```

### Pattern 5: Playwright E2E with feather-testing-convex
**What:** Use `createConvexTest()` for auto-cleanup between tests
**When to use:** All E2E tests against a real Convex deployment
**Example:**
```typescript
// Source: feather-testing-convex README
// e2e/fixtures.ts
import { createConvexTest } from "feather-testing-convex/playwright";
import { api } from "../convex/_generated/api";

export const test = createConvexTest({
  convexUrl: process.env.VITE_CONVEX_URL!,
  clearAll: api.testing.clearAll,
});
export { expect } from "@playwright/test";

// e2e/auth.spec.ts
import { test, expect } from "./fixtures";

test("user can sign up with email/password", async ({ session }) => {
  await session
    .visit("/login")
    .fillIn("Email", "test@example.com")
    .fillIn("Password", "password123")
    .clickButton("Sign up")
    .assertText("Welcome");
});
```

### Pattern 6: Lefthook Pre-Commit Configuration
**What:** Run vitest coverage check on every commit
**When to use:** DX-02 requirement
**Example:**
```yaml
# lefthook.yml
pre-commit:
  commands:
    typecheck:
      run: npx tsc -p tsconfig.app.json --noEmit && npx tsc -p tsconfig.node.json --noEmit && npx tsc -p convex/tsconfig.json --noEmit
    test-coverage:
      run: npx vitest run --coverage
```

### Anti-Patterns to Avoid
- **Separate Resend provider IDs for OTP vs reset:** The `id` field in the Resend provider config matters -- if the existing OTP provider uses `"resend-otp"` and the reset provider also uses `"resend-otp"`, they may conflict. Use distinct IDs like `"resend-otp"` and `"password-reset"`.
- **Skipping the `flow` field:** The Password provider requires a `flow` field to distinguish signUp from signIn. Without it, the behavior is undefined.
- **Testing against dev deployment:** E2E tests must use a separate Convex deployment to avoid corrupting development data. The `clearAll` mutation runs after each test.
- **Intercepting emails only in dev mode:** The dev mailbox table storage should be environment-aware. In production, skip the table insert to avoid storing sensitive data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt/argon2 setup | `@convex-dev/auth` Password provider | Uses Scrypt (Lucia) by default, handles salt, timing-safe comparison |
| Auth session management | Custom JWT/session tokens | `@convex-dev/auth` session system | Already handles refresh, expiry, cross-tab sync |
| Password reset token flow | Custom token generation + validation | `Password({ reset: ... })` config | Handles token generation, expiry (20min default), verification |
| Git hook management | `.git/hooks/` scripts | Lefthook | Cross-platform, parallel execution, survives git operations |
| E2E test cleanup | Manual DB cleanup scripts | `feather-testing-convex/playwright` `clearAll` | Auto-runs after each test via fixture |
| Browser test assertions | Raw Playwright locators | `feather-testing-core` Session DSL | Fluent API, auto-waiting, detailed error chain traces |

**Key insight:** The `@convex-dev/auth` Password provider handles the entire auth lifecycle (hashing, sessions, reset tokens) -- the only custom code needed is the email-sending function and the UI forms.

## Common Pitfalls

### Pitfall 1: Resend Provider ID Collision
**What goes wrong:** Both the existing OTP provider and the password reset provider use `id: "resend-otp"`, causing conflicts in token resolution.
**Why it happens:** The Convex Auth docs example reuses `"resend-otp"` as the ID for the reset provider.
**How to avoid:** Give the password reset provider a unique ID like `"password-reset"`.
**Warning signs:** Token verification fails, wrong email template sent.

### Pitfall 2: sendEmail Signature Change for Dev Interception
**What goes wrong:** The existing `sendEmail()` is a plain async function, not a Convex action. Adding `ctx.runMutation()` requires an `ActionCtx`.
**Why it happens:** The current `sendEmail()` in `convex/email/index.ts` takes raw options, not a Convex context.
**How to avoid:** Either (a) create a new Convex action that wraps `sendEmail()` + stores to devEmails table, or (b) intercept at the provider level where `ActionCtx` is available. The password reset provider's `sendVerificationRequest` is an action context and can store emails there.
**Warning signs:** TypeScript errors about missing `ctx` parameter.

### Pitfall 3: Password Provider Not Adding to authTables
**What goes wrong:** Password provider needs additional auth tables that may not exist.
**Why it happens:** `authTables` from `@convex-dev/auth/server` is already spread in the schema, but the password provider may need the `authVerificationCodes` or `authVerifiers` tables.
**How to avoid:** Verify `authTables` includes all required tables by checking the Convex Auth docs. The existing `...authTables` spread should cover this, but verify after adding the Password provider.
**Warning signs:** Runtime errors about missing tables during sign-up.

### Pitfall 4: E2E Tests Failing on Timing
**What goes wrong:** Playwright tests fail because Convex mutations haven't propagated yet.
**Why it happens:** Convex is reactive but there's latency between mutation and query update.
**How to avoid:** Use `assertText()` from the Session DSL which auto-waits. Never assert synchronously after an action.
**Warning signs:** Flaky tests that pass on retry.

### Pitfall 5: Coverage Excludes Not Updated
**What goes wrong:** New password/devEmails files aren't in coverage includes, causing 100% threshold to report wrong numbers, or new files that should be excluded aren't.
**Why it happens:** `vitest.config.ts` has explicit include/exclude lists that must be maintained.
**How to avoid:** After adding new files, review and update the coverage include/exclude lists in `vitest.config.ts`. Password-related backend code (like the reset provider) should follow the existing exclusion pattern for `convex/otp/**`.
**Warning signs:** Coverage drops below 100% or counts untestable files.

### Pitfall 6: clearAll Mutation Not Comprehensive
**What goes wrong:** E2E tests leave orphaned data because `clearAll` doesn't clean all tables.
**Why it happens:** New tables (devEmails, auth tables) weren't added to the cleanup mutation.
**How to avoid:** The `clearAll` mutation must iterate all tables including auth tables. Use `ctx.db.query(tableName).collect()` + `ctx.db.delete()` for each.
**Warning signs:** Tests pass individually but fail when run together.

## Code Examples

### Password Sign-Up/Sign-In Form with TanStack Form
```typescript
// Source: Convex Auth docs + project's existing form pattern
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

function PasswordForm() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await signIn("password", { ...value, flow: mode });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field
        name="email"
        validators={{ onSubmit: z.string().email() }}
        children={(field) => (
          <Input
            type="email"
            placeholder="Email"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <form.Field
        name="password"
        validators={{ onSubmit: z.string().min(8) }}
        children={(field) => (
          <Input
            type="password"
            placeholder="Password"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <Button type="submit">{mode === "signIn" ? "Sign In" : "Sign Up"}</Button>
      <Button variant="ghost" onClick={() => setMode(m => m === "signIn" ? "signUp" : "signIn")}>
        {mode === "signIn" ? "Sign up instead" : "Sign in instead"}
      </Button>
    </form>
  );
}
```

### Password Reset Flow
```typescript
// Source: https://labs.convex.dev/auth/config/passwords
function PasswordResetForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");

  if (step === "forgot") {
    // Step 1: Request reset code
    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email") as string;
        await signIn("password", { email, flow: "reset" });
        setStep({ email });
      }}>
        <Input name="email" placeholder="Email" type="email" />
        <Button type="submit">Send Reset Code</Button>
      </form>
    );
  }

  // Step 2: Enter code + new password
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      await signIn("password", {
        email: step.email,
        code: fd.get("code") as string,
        newPassword: fd.get("newPassword") as string,
        flow: "reset-verification",
      });
    }}>
      <Input name="code" placeholder="Reset Code" />
      <Input name="newPassword" placeholder="New Password" type="password" />
      <Button type="submit">Reset Password</Button>
    </form>
  );
}
```

### Dev Email Table Schema
```typescript
// In convex/schema.ts, add:
devEmails: defineTable({
  to: v.array(v.string()),
  subject: v.string(),
  html: v.string(),
  text: v.optional(v.string()),
  sentAt: v.number(),
}).index("sentAt", ["sentAt"]),
```

### Playwright E2E Auth Test
```typescript
// Source: feather-testing-convex README + feather-testing-core README
// e2e/auth.spec.ts
import { test, expect } from "./fixtures";

test("full password auth lifecycle", async ({ session }) => {
  // Sign up
  await session
    .visit("/login")
    .fillIn("Email", "e2e@example.com")
    .fillIn("Password", "password123")
    .clickButton("Sign up")
    .assertPath("/onboarding/username");

  // Complete onboarding
  await session
    .fillIn("Username", "e2etester")
    .clickButton("Continue")
    .assertPath("/dashboard");

  // Sign out
  await session.clickButton("Sign out");

  // Sign in
  await session
    .fillIn("Email", "e2e@example.com")
    .fillIn("Password", "password123")
    .clickButton("Sign in")
    .assertPath("/dashboard");
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `oslo/crypto` for random strings | `@oslojs/crypto/random` | oslo v2 (2024) | Both work; `@oslojs/crypto` is the newer API. Project has both installed |
| Husky for git hooks | Lefthook | 2023+ adoption | Faster, simpler YAML config, parallel execution |
| Custom Playwright fixtures | `feather-testing-convex/playwright` | Already available | Zero-config Convex cleanup + Session DSL |
| Mock-heavy unit tests | Integration tests via `feather-testing-convex` | Already adopted | Real backend, no mocking for data flows |

**Deprecated/outdated:**
- `oslo` v1 API: Still works but `@oslojs/*` is the successor. Can use either since both are installed.

## Open Questions

1. **Dev email interception architecture**
   - What we know: `sendEmail()` in `convex/email/index.ts` is a plain function (not a Convex action). The password reset provider sends emails in its `sendVerificationRequest` callback which runs in an action context.
   - What's unclear: Should we intercept at the `sendEmail()` level (requires refactoring to accept ActionCtx) or at each email-sending callsite? The OTP provider uses the Resend SDK directly, not `sendEmail()`.
   - Recommendation: Intercept at each provider's `sendVerificationRequest` to store in devEmails table. Create a shared helper `storeDevEmail(ctx, emailData)` called from both OTP and password reset providers. Gate on an environment variable (e.g., `DEV_MAILBOX=true`).

2. **E2E test auth strategy for non-auth tests**
   - What we know: Auth flow tests should use the real login flow. But tests for onboarding, settings, billing need an authenticated state.
   - What's unclear: Should all tests go through the full sign-up flow, or use a programmatic auth shortcut?
   - Recommendation: Create a reusable `signUp(session)` helper function (composable Session pattern from feather-testing-core) that all tests call. Since these run against a real deployment, the real auth flow is the right approach -- it's fast enough with Playwright's auto-waiting.

3. **Password reset email in E2E tests**
   - What we know: Password reset sends a code via email. In E2E, we can't intercept Resend API calls.
   - What's unclear: How to test the full reset flow in E2E without checking real email.
   - Recommendation: Use the dev mailbox. After requesting a reset, query the devEmails table (via a test-only Convex function) to get the code, then enter it in the form. This validates the full flow.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (unit/integration) + Playwright latest (E2E) |
| Config file | `vitest.config.ts` (exists), `playwright.config.ts` (Wave 0) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage && npx playwright test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Sign up/in with email+password | E2E | `npx playwright test e2e/auth.spec.ts` | No -- Wave 0 |
| AUTH-01 | Password form component renders | unit | `npx vitest run src/features/auth/` | No -- Wave 0 |
| AUTH-02 | Password reset flow | E2E | `npx playwright test e2e/auth.spec.ts` | No -- Wave 0 |
| DX-01 | Dev mailbox captures emails | unit | `npx vitest run convex/devEmails/` | No -- Wave 0 |
| DX-01 | Dev mailbox route displays emails | E2E | `npx playwright test e2e/dev-mailbox.spec.ts` | No -- Wave 0 |
| DX-02 | Pre-commit hook runs coverage | manual-only | `git commit` triggers Lefthook | N/A -- manual verification |
| DX-03 | E2E tests cover user flows | E2E | `npx playwright test` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --coverage`
- **Per wave merge:** `npx vitest run --coverage && npx playwright test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `playwright.config.ts` -- Playwright configuration
- [ ] `e2e/fixtures.ts` -- Convex Playwright test setup with `createConvexTest()`
- [ ] `e2e/auth.spec.ts` -- Auth flow E2E tests
- [ ] `convex/testing/clearAll.ts` -- Mutation to clear all test data
- [ ] Framework install: `npm install -D @playwright/test lefthook && npx playwright install chromium`

## Sources

### Primary (HIGH confidence)
- [Convex Auth Password docs](https://labs.convex.dev/auth/config/passwords) -- Password provider setup, reset flow, code examples
- [Convex Auth Password API reference](https://labs.convex.dev/auth/api_reference/providers/Password) -- PasswordConfig interface, flows, crypto options
- `feather-testing-convex` README (local) -- Playwright integration, createConvexTest, Session DSL, auto-cleanup
- `feather-testing-core` README (local) -- Session DSL API, composable helpers, error messages

### Secondary (MEDIUM confidence)
- [Lefthook GitHub](https://github.com/evilmartians/lefthook) -- Configuration, npm install, pre-commit setup
- [Lefthook npm](https://www.npmjs.com/package/lefthook) -- Installation instructions
- Existing codebase: `convex/auth.ts`, `convex/otp/ResendOTP.ts`, `convex/email/index.ts`, `vitest.config.ts`

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or existing code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed or have official Convex docs
- Architecture: HIGH -- patterns directly from Convex Auth docs + feather-testing-convex README
- Pitfalls: HIGH -- identified from code inspection of existing patterns + official docs
- Validation: MEDIUM -- Playwright config details need verification during implementation

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable libraries, low churn)
