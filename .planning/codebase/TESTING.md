# Testing Patterns

**Analysis Date:** 2026-03-09

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in `expect` + `@testing-library/jest-dom/vitest` matchers (e.g. `toBeInTheDocument()`)

**Run Commands:**
```bash
npm test                # Run all tests (vitest run)
npm run test:watch      # Watch mode (vitest)
npx vitest --coverage   # Coverage report
```

## Test Environments

**Two environments configured via `environmentMatchGlobs`:**
- `convex/**` files: `edge-runtime` (simulates Convex serverless runtime)
- Everything else (`src/**`, root): `jsdom` (browser simulation)

**Setup file:** `src/test-setup.ts` -- loaded for all tests
- Imports `@testing-library/jest-dom/vitest` for DOM matchers
- Suppresses known unhandled rejections from scheduled Stripe actions via `process.on("unhandledRejection", ...)`

## Test File Organization

**Location:** Co-located with source files

**Naming:** `{source-file-name}.test.ts(x)`

**Structure:**
```
convex/
  app.ts             # source
  app.test.ts        # backend test
  stripe.ts          # source
  stripe.test.ts     # backend test
  test.setup.ts      # backend test helpers + fixtures
src/
  test-setup.ts      # global test setup (vitest setupFiles)
  test-helpers.tsx   # renderWithRouter helper
  ui/
    button.tsx
    button.test.tsx
  utils/
    misc.ts
    misc.test.ts
    validators.ts
    validators.test.ts
  routes/_app/_auth/dashboard/
    _layout.settings.index.tsx
    _layout.settings.index.test.tsx
site.config.ts
site.config.test.ts
```

## Test Structure

**Backend tests (Convex functions):**
```typescript
import { describe, expect } from "vitest";
import { api } from "./_generated/api";
import { test, seedPlans, seedSubscription } from "./test.setup";

describe("getCurrentUser", () => {
  test("returns null when unauthenticated", async ({ testClient }) => {
    const result = await testClient.query(api.app.getCurrentUser, {});
    expect(result).toBeNull();
  });

  test("returns user with subscription and planKey", async ({
    client,
    testClient,
    userId,
  }) => {
    const { freePlanId } = await seedPlans(testClient);
    await seedSubscription(testClient, { userId, planId: freePlanId });

    const result = await client.query(api.app.getCurrentUser, {});
    expect(result!.subscription!.planKey).toBe("free");
  });
});
```

**Key pattern:** The custom `test` from `convex/test.setup.ts` provides fixtures:
- `testClient` -- unauthenticated Convex test client (for PREAUTH/UNAUTH functions and seeding)
- `client` -- authenticated Convex test client (has a user session)
- `userId` -- ID of the auto-created authenticated user

**Frontend tests (React components):**
```typescript
import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, seedPlans, seedSubscription } from "@cvx/test.setup";
import { renderWithRouter } from "@/test-helpers";
import BillingSettings, { Route } from "./_layout.settings.billing";

describe("Route.beforeLoad", () => {
  it("returns the correct context", () => {
    const context = Route.options.beforeLoad!({} as any);
    expect(context).toEqual({ title: "Billing", ... });
  });
});

test("renders current plan badge as Free", async ({ client, testClient, userId }) => {
  const { freePlanId } = await seedPlans(testClient);
  await seedSubscription(testClient, { userId, planId: freePlanId });

  renderWithRouter(<BillingSettings />, client);

  await waitFor(() => {
    expect(screen.getByText(/you are currently on the/i)).toBeInTheDocument();
  });
});
```

**Patterns:**
- Route `beforeLoad` tested in a `describe` block using `it`
- Component rendering tests use the custom `test` fixture (from `convex/test.setup.ts`)
- All component tests seed required backend data before rendering
- User interactions via `userEvent.setup()` then `await user.click(...)`, `await user.type(...)`

## Test Fixtures and Seed Helpers

**Backend test setup:** `convex/test.setup.ts`
```typescript
import { createConvexTest } from "feather-testing-convex";
import schema from "./schema";

export const modules = import.meta.glob("./**/!(*.*.*)*.*s");
export const test = createConvexTest(schema, modules);
```

The `test` function (from `feather-testing-convex`) extends Vitest's `test` with:
- Auto-creates an authenticated user per test
- Provides `{ client, testClient, userId }` as test context
- Each test gets an isolated Convex database

**Seed helpers** (also in `convex/test.setup.ts`):
```typescript
// Seed Free + Pro plans
export async function seedPlans(testClient) → { freePlanId, proPlanId }

// Seed plans + free subscription + optional username/customerId
export async function seedFreeUser(testClient, userId, opts?) → { freePlanId, proPlanId }

// Seed a subscription for a user
export async function seedSubscription(testClient, opts) → subscriptionId
```

**Usage pattern:** Always seed plans first, then subscriptions, then patch user fields:
```typescript
const { freePlanId } = await seedPlans(testClient);
await seedSubscription(testClient, { userId, planId: freePlanId });
await testClient.run(async (ctx: any) => {
  await ctx.db.patch(userId, { username: "testuser", customerId: "cus_123" });
});
```

## Frontend Test Helper

**`src/test-helpers.tsx` -- `renderWithRouter()`:**
```typescript
export function renderWithRouter(
  ui: ReactNode,
  client: ConvexTestClient,
  options?: { authenticated?: boolean; initialPath?: string },
)
```

Wraps the component with:
1. Real TanStack Router (memory history + catch-all route)
2. `ConvexTestQueryAuthProvider` from `feather-testing-convex/tanstack-query` (QueryClient + ConvexProvider + auth context)

**Zero mocking approach:** `useQuery(convexQuery(...))`, `useConvexMutation(...)`, `useAuthActions()`, `useConvexAuth()`, `<Link>`, `useNavigate()`, and `useRouter()` all work against a real in-memory Convex backend.

**Unauthenticated rendering:**
```typescript
renderWithRouter(<Component />, testClient, { authenticated: false });
```

## Mocking

**Framework:** Vitest built-in `vi.fn()`, `vi.stubGlobal()`, `vi.useFakeTimers()`

**What is mocked:**
- `navigator.languages` for locale-dependent tests: `vi.stubGlobal("navigator", { languages: ["de-DE"] })`
- Timers for timeout-dependent UI: `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()`
- Route `beforeLoad` context: `{} as any` or `{ context: { queryClient: mockQueryClient } } as any`

**What is NOT mocked (by design):**
- Convex backend -- uses real `convex-test` / `feather-testing-convex` in-memory database
- React Query -- real QueryClient via `ConvexTestQueryAuthProvider`
- TanStack Router -- real memory router
- DOM -- real jsdom rendering via `@testing-library/react`

**Stripe actions:**
- Not mocked, but expected failures are handled:
  - Global suppression via `src/test-setup.ts` `SUPPRESSED_MESSAGES`
  - Per-test try/catch for mutations that schedule Stripe actions
  - `/* v8 ignore */` on Stripe SDK call sites in source code

## Coverage

**Requirements:** 100% statements, branches, functions, and lines (on included files)

**Configuration** (from `vitest.config.ts`):
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "json-summary"],
  include: [
    "convex/app.ts",
    "convex/schema.ts",
    "convex/stripe.ts",
    "errors.ts",
    "src/utils/**",
    "src/ui/button.tsx",
    "src/ui/button-util.ts",
    "src/ui/input.tsx",
    "src/ui/switch.tsx",
    "src/ui/use-double-check.ts",
    "src/routes/_app/_auth/dashboard/_layout.index.tsx",
    "src/routes/_app/_auth/dashboard/_layout.checkout.tsx",
    "src/routes/_app/_auth/dashboard/_layout.settings.index.tsx",
    "src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx",
    "src/routes/_app/_auth/onboarding/_layout.username.tsx",
  ],
  thresholds: {
    statements: 100,
    branches: 100,
    functions: 100,
    lines: 100,
  },
}
```

**Excluded from coverage:**
- Stripe SDK call sites (`convex/http.ts`, external action bodies)
- Auth provider config (`convex/auth.ts`, `convex/auth.config.ts`)
- Auto-generated code (`convex/_generated/**`)
- Test infrastructure (`convex/test.setup.ts`, `src/test-helpers.tsx`, `src/test-setup.ts`)
- Framework entry points (`src/main.tsx`, `src/app.tsx`, `src/router.tsx`)
- Pure pass-through UI wrappers (`src/ui/dropdown-menu.tsx`, `src/ui/select.tsx`, etc.)
- Route layouts and login flows

**Inline exclusions:** Use `/* v8 ignore start/stop */` for lines within included files that cannot be tested:
- Stripe redirect handlers (`window.location.href = ...`)
- TanStack Form re-render timing branches
- Upload callbacks from `@xixixao/uploadstuff`

**View Coverage:**
```bash
npx vitest --coverage
# Reports: text (terminal), lcov, json-summary in ./coverage/
```

## Test Types

**Unit Tests:**
- Pure utility functions: `src/utils/misc.test.ts`, `src/utils/validators.test.ts`
- React hooks: `src/ui/use-double-check.test.ts` (via `renderHook`)
- UI components: `src/ui/button.test.tsx` (via `render` + screen queries)
- Config validation: `site.config.test.ts`

**Integration Tests (backend):**
- Convex query/mutation functions tested against in-memory Convex database
- Files: `convex/app.test.ts`, `convex/stripe.test.ts`
- Full function execution with schema validation, indexes, and scheduled functions
- Auth tested via `client` (authenticated) vs `testClient` (unauthenticated)

**Integration Tests (frontend):**
- Route components rendered with real router + real Convex backend
- Files: all `src/routes/**/*.test.tsx`
- Test full data flow: seed backend -> render component -> assert DOM -> interact -> verify backend state
- Example: type username -> click submit -> verify `api.app.getCurrentUser` returns updated name

**E2E Tests:** Not used

## Common Patterns

**Async data rendering (waitFor pattern):**
```typescript
renderWithRouter(<Component />, client);
await waitFor(() => {
  expect(screen.getByText(/expected text/i)).toBeInTheDocument();
});
```

**User interaction:**
```typescript
const user = userEvent.setup();
await user.type(screen.getByPlaceholderText("Username"), "newuser");
await user.click(screen.getByRole("button", { name: /save/i }));
```

**Verifying backend state after UI interaction:**
```typescript
await waitFor(async () => {
  const updatedUser = await client.query(api.app.getCurrentUser, {});
  expect(updatedUser?.username).toBe("newname");
});
```

**Error/throw testing:**
```typescript
await expect(
  testClient.mutation(api.app.generateUploadUrl, {}),
).rejects.toThrow("User not found");
```

**Unauthenticated rendering (empty output):**
```typescript
const { container } = renderWithRouter(<Component />, testClient, {
  authenticated: false,
});
await waitFor(
  () => { expect(container.innerHTML).toBe(""); },
  { timeout: 2000 },
);
```

**Scheduled function failures (Stripe):**
```typescript
try {
  await client.mutation(api.app.completeOnboarding, { username: "test", currency: "usd" });
  await testClient.finishInProgressScheduledFunctions();
} catch {
  // Expected: the scheduled Stripe action fails
}
```

**Fake timers for timeout-based UI:**
```typescript
vi.useFakeTimers({ shouldAdvanceTime: true });
renderWithRouter(<Component />, client);
await vi.advanceTimersByTimeAsync(8500);
await waitFor(() => { expect(screen.getByText("Something went wrong.")).toBeInTheDocument(); });
vi.useRealTimers();
```

## Adding New Tests

**New backend function test:**
1. Create `convex/{module}.test.ts`
2. Import `{ test, seedPlans, seedSubscription }` from `@cvx/test.setup`
3. Use `describe` per function, `test` per case
4. Add source file to `vitest.config.ts` coverage `include` array

**New frontend component test:**
1. Create `src/routes/.../{component}.test.tsx` adjacent to the component
2. Import `{ test, seedPlans, seedSubscription }` from `@cvx/test.setup`
3. Import `{ renderWithRouter }` from `@/test-helpers`
4. Seed backend data, then `renderWithRouter(<Component />, client)`
5. Add source file to `vitest.config.ts` coverage `include` array

**New utility/hook test:**
1. Create `{file}.test.ts(x)` adjacent to source
2. Use standard Vitest `describe`/`it` (no custom `test` fixture needed unless Convex is involved)
3. For hooks, use `renderHook` from `@testing-library/react`

---

*Testing analysis: 2026-03-09*
