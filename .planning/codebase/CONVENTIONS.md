# Coding Conventions

**Analysis Date:** 2026-03-09

## Naming Patterns

**Files:**
- Route components: `_layout.{segment}.tsx` (TanStack Router flat-file convention) -- e.g. `src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx`
- UI components: `kebab-case.tsx` -- e.g. `src/ui/button.tsx`, `src/ui/use-double-check.ts`
- Utilities: `kebab-case.ts` -- e.g. `src/utils/misc.ts`, `src/utils/validators.ts`
- Backend functions: `camelCase.ts` -- e.g. `convex/app.ts`, `convex/stripe.ts`
- Test files: co-located `{name}.test.ts(x)` -- e.g. `convex/app.test.ts`, `src/ui/button.test.tsx`
- Config at root: `kebab-case` -- e.g. `site.config.ts`, `errors.ts`, `types.ts`

**Functions:**
- React components: `PascalCase` named exports + default export -- e.g. `export default function BillingSettings()`
- Hooks: `useCamelCase` -- e.g. `useDoubleCheck`, `useSignOut`
- Convex queries/mutations: `camelCase` -- e.g. `getCurrentUser`, `updateUsername`
- Internal Convex functions with no auth context: `PREAUTH_camelCase` or `UNAUTH_camelCase` prefix -- e.g. `PREAUTH_createStripeCustomer`, `UNAUTH_getDefaultPlan`
- Event handlers in components: `handleCamelCase` -- e.g. `handleCreateSubscriptionCheckout`, `handleDeleteAccount`

**Variables:**
- Local state: `camelCase` -- e.g. `selectedPlanId`, `isSubmitting`
- Constants/enums: `UPPER_SNAKE_CASE` objects with `camelCase` values -- e.g. `PLANS.FREE = "free"`, `CURRENCIES.USD = "usd"`
- Convex validators: `camelCaseValidator` -- e.g. `currencyValidator`, `intervalValidator`

**Types:**
- Type aliases and interfaces: `PascalCase` -- e.g. `Currency`, `Interval`, `PlanKey`, `ButtonProps`
- Exported from root `types.ts` or inline with schema

## Code Style

**Formatting:**
- Prettier with default configuration (empty `.prettierrc` = `{}`)
- 2-space indentation (Prettier default)
- Double quotes for strings (Prettier default)
- Trailing commas in ES5 positions (Prettier default)

**Linting:**
- ESLint flat config at `eslint.config.js`
- Base: `@eslint/js` recommended + `typescript-eslint` strict
- Plugins: `react-hooks` recommended, `react-refresh` (warn only, disabled for route files)
- `eslint-config-prettier` applied last to disable conflicting rules
- Key relaxed rules:
  - `@typescript-eslint/no-unused-vars`: off
  - `@typescript-eslint/no-empty-object-type`: off
  - `@typescript-eslint/no-explicit-any`: off (in test files only)
  - `@typescript-eslint/no-non-null-assertion`: off (in test files only)

**TypeScript:**
- Strict mode enabled in `tsconfig.app.json`
- `noUnusedLocals` and `noUnusedParameters` enabled at tsconfig level
- Target: ES2022
- Three tsconfig references: `tsconfig.app.json` (app + convex), `tsconfig.node.json` (vite config), `convex/tsconfig.json` (backend)

## Import Organization

**Order:**
1. React / framework imports (`react`, `@tanstack/react-router`, `@tanstack/react-query`)
2. External library imports (`convex`, `@convex-dev/react-query`, `lucide-react`, `zod`)
3. Internal UI imports using `@/` alias (`@/ui/button`, `@/utils/misc`)
4. Convex API imports using `~/` and `@cvx/` aliases (`~/convex/_generated/api`, `@cvx/schema`)
5. Relative imports (sibling validators, routes)

**Path Aliases:**
- `@/*` -> `./src/*` -- frontend source
- `@cvx/*` -> `./convex/*` -- backend source
- `~/*` -> `./*` -- project root (used for `~/convex/_generated/api`, `~/errors`, `~/types`)

## Error Handling

**Backend (Convex functions):**
- Centralized error messages in `errors.ts` as `ERRORS` constant object
- Pattern: check auth first, return early (no throw) for unauthenticated users on non-critical operations
- Pattern: throw `new Error(ERRORS.SOMETHING)` for critical failures (missing data, invariant violations)
- Example from `convex/app.ts`:
```typescript
const userId = await auth.getUserId(ctx);
if (!userId) {
  return;  // silent return for queries/mutations
}
// vs.
if (!user) {
  throw new Error("User not found");  // throw for critical paths
}
```

**Frontend (React components):**
- Components return `null` when data is not yet loaded: `if (!user) { return null; }`
- Stripe/external actions wrapped in `/* v8 ignore */` comments since they call external APIs
- No try/catch in component handlers -- mutations propagate errors to React Query

**Coverage exclusions:**
- Use `/* v8 ignore start */` / `/* v8 ignore stop */` for code that calls external APIs (Stripe SDK)
- Use `/* v8 ignore next N */` for single unreachable lines
- Always add a comment explaining WHY the block is excluded

## Logging

**Framework:** `console.error` (no logging library)

**Patterns:**
- Use `console.error` for non-fatal errors in backend: `console.error("No subscription found")`
- Stripe SDK errors caught and logged: `.catch((err) => console.error(err))`

## Comments

**When to Comment:**
- `/** JSDoc */` for exported functions explaining purpose
- Inline comments for non-obvious business logic
- `// eslint-disable-next-line` with rule name when suppressing
- `/* v8 ignore */` blocks always include a reason comment

**JSDoc/TSDoc:**
- Used on Convex action/mutation exports to describe purpose
- Example: `/** Creates a Stripe customer for a user. */`
- Not used on React components or hooks

## Function Design

**Convex functions:**
- Each function declared with `query({})`, `mutation({})`, `action({})` etc.
- Args validated via Convex `v.*` validators
- Handler receives `(ctx, args)` -- always async
- Auth check is always the first operation

**React components:**
- Exported as both named default export and via `Route` for TanStack Router
- Pattern: `export const Route = createFileRoute(...)({ component: ComponentName }); export default function ComponentName() {}`
- Data fetching via `useQuery(convexQuery(api.module.functionName, {}))` -- never raw `useEffect` for data
- Mutations via `useMutation({ mutationFn: useConvexMutation(api.module.functionName) })`

## Module Design

**Exports:**
- Route files export `Route` (named) and the component as default
- Utility files export individual named functions
- Schema exports validators, type aliases, and the default schema
- `errors.ts` exports a single `ERRORS` const object
- No barrel files (`index.ts` re-exports) -- imports go directly to source files

**Validation:**
- Backend: Convex `v.*` validators in function `args` objects (see `convex/schema.ts`)
- Frontend: Zod schemas in `src/utils/validators.ts`, used with TanStack Form's `validators.onSubmit`
- Shared constants (PLANS, CURRENCIES, INTERVALS) defined in `convex/schema.ts` and imported by both frontend and backend

## UI Patterns

**Component library:** Custom components wrapping Radix UI primitives with `class-variance-authority` (CVA)
- Button: `src/ui/button.tsx` + `src/ui/button-util.ts` (variants separated)
- Switch, Input, Select, DropdownMenu: thin Radix wrappers in `src/ui/`
- Styling: Tailwind CSS v4 utility classes, merged via `cn()` from `src/utils/misc.ts`

**Forms:**
- TanStack Form (`@tanstack/react-form`) for form state management
- Pattern: `useForm({ defaultValues, onSubmit })` + `<form.Field>` render prop
- Validation: Zod schemas passed to `validators.onSubmit`
- Submit handler prevents default and delegates to `form.handleSubmit()`

---

*Convention analysis: 2026-03-09*
