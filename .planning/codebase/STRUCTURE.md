# Codebase Structure

**Analysis Date:** 2026-03-09

## Directory Layout

```
feather-starter-convex/
├── convex/                     # Backend (Convex serverless functions)
│   ├── _generated/             # Auto-generated Convex types and API (DO NOT EDIT)
│   ├── email/                  # Email sending infrastructure
│   │   ├── index.ts            # sendEmail() helper using Resend API
│   │   └── templates/          # React Email templates
│   │       └── subscriptionEmail.tsx
│   ├── otp/                    # OTP authentication provider
│   │   ├── ResendOTP.ts        # Email OTP provider config
│   │   └── VerificationCodeEmail.tsx  # OTP email template
│   ├── app.ts                  # Core app queries/mutations (user, plans)
│   ├── auth.config.ts          # Auth configuration
│   ├── auth.ts                 # Auth provider setup (GitHub + ResendOTP)
│   ├── env.ts                  # Environment variable exports
│   ├── http.ts                 # HTTP routes (Stripe webhooks, auth)
│   ├── init.ts                 # Seed data (Stripe products/plans)
│   ├── schema.ts               # Database schema + domain constants
│   ├── stripe.ts               # Stripe integration (subscriptions, checkout, portal)
│   ├── test.setup.ts           # Backend test setup
│   ├── tsconfig.json           # Convex-specific TypeScript config
│   ├── *.test.ts               # Backend tests (co-located)
│   └── README.md
├── src/                        # Frontend (React SPA)
│   ├── assets/                 # Static assets (images)
│   ├── routes/                 # TanStack Router file-based routes
│   │   ├── __root.tsx          # Root route (Helmet, devtools)
│   │   ├── index.tsx           # Landing page (/)
│   │   ├── _app.tsx            # App layout route (loads current user)
│   │   ├── _app/               # Nested under _app layout
│   │   │   ├── _auth.tsx       # Auth guard layout (redirects to /login)
│   │   │   ├── _auth/          # Authenticated routes
│   │   │   │   ├── dashboard/  # Dashboard feature area
│   │   │   │   │   ├── _layout.tsx              # Dashboard shell (nav + header)
│   │   │   │   │   ├── _layout.index.tsx        # /dashboard
│   │   │   │   │   ├── _layout.checkout.tsx     # /dashboard/checkout
│   │   │   │   │   ├── _layout.settings.tsx     # /dashboard/settings layout
│   │   │   │   │   ├── _layout.settings.index.tsx   # /dashboard/settings
│   │   │   │   │   ├── _layout.settings.billing.tsx # /dashboard/settings/billing
│   │   │   │   │   ├── -ui.navigation.tsx       # Dashboard-scoped UI component
│   │   │   │   │   └── *.test.tsx               # Route tests (co-located)
│   │   │   │   └── onboarding/ # Onboarding feature area
│   │   │   │       ├── _layout.tsx              # Onboarding shell
│   │   │   │       ├── _layout.username.tsx     # /onboarding/username
│   │   │   │       └── *.test.tsx               # Route tests (co-located)
│   │   │   └── login/          # Login (public, no auth guard)
│   │   │       ├── _layout.tsx              # Login shell (split-screen)
│   │   │       └── _layout.index.tsx        # /login
│   ├── types/                  # Type declarations
│   │   └── uploadstuff.d.ts    # Module declaration for @xixixao/uploadstuff
│   ├── ui/                     # Shared UI components
│   │   ├── button.tsx          # Button component (Radix Slot + CVA)
│   │   ├── button-util.ts      # buttonVariants() extracted for use outside JSX
│   │   ├── dropdown-menu.tsx   # Radix DropdownMenu wrapper
│   │   ├── header.tsx          # App header
│   │   ├── input.tsx           # Input component
│   │   ├── language-switcher.tsx # i18n language toggle
│   │   ├── logo.tsx            # Logo component
│   │   ├── select.tsx          # Radix Select wrapper
│   │   ├── switch.tsx          # Radix Switch wrapper
│   │   ├── theme-switcher.tsx  # Dark/light mode toggle
│   │   ├── use-double-check.ts # useDoubleCheck() hook for destructive actions
│   │   └── *.test.*            # Component tests (co-located)
│   ├── utils/                  # Shared utilities
│   │   ├── misc.ts             # cn(), callAll(), getLocaleCurrency(), useSignOut()
│   │   ├── validators.ts       # Zod validators (username)
│   │   └── *.test.*            # Utility tests (co-located)
│   ├── app.tsx                 # Root React component (providers wrapper)
│   ├── i18n.ts                 # i18next initialization
│   ├── index.css               # Global styles (Tailwind)
│   ├── main.tsx                # ReactDOM entry point
│   ├── router.tsx              # TanStack Router instance
│   ├── routeTree.gen.ts        # Auto-generated route tree (DO NOT EDIT)
│   ├── test-helpers.tsx        # renderWithRouter() test utility
│   ├── test-setup.ts           # Vitest global setup
│   └── vite-env.d.ts           # Vite env type declarations
├── public/                     # Static public assets (served as-is)
│   ├── images/                 # Public images
│   └── locales/                # i18n translation files
│       ├── en/translation.json
│       └── es/translation.json
├── dist/                       # Build output (generated, not committed)
├── coverage/                   # Test coverage output (generated)
├── .planning/                  # Planning documents
│   └── codebase/               # Codebase analysis documents
├── errors.ts                   # Centralized error message constants (ERRORS object)
├── types.ts                    # Shared TypeScript types (User)
├── site.config.ts              # Site metadata (title, description, URLs)
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── tsconfig.json               # Root TypeScript config (references app + node)
├── tsconfig.app.json           # App TypeScript config (src + convex)
├── tsconfig.node.json          # Node TypeScript config (vite configs)
├── eslint.config.js            # ESLint flat config
├── netlify.toml                # Netlify deployment config
├── package.json                # Dependencies and scripts
└── package-lock.json           # Dependency lockfile
```

## Directory Purposes

**`convex/`:**
- Purpose: All backend logic runs here as Convex serverless functions
- Contains: Queries, mutations, actions, HTTP routes, schema, auth config
- Key files: `app.ts` (core CRUD), `stripe.ts` (billing), `schema.ts` (data model), `http.ts` (webhooks)
- Has its own `tsconfig.json` for Convex-specific compilation
- Tests are co-located as `*.test.ts` files

**`convex/_generated/`:**
- Purpose: Auto-generated Convex types and API bindings
- Generated: Yes (by `convex dev`)
- Committed: Yes
- NEVER edit these files manually

**`convex/email/`:**
- Purpose: Email infrastructure using Resend API
- Contains: `index.ts` (generic sendEmail helper), `templates/` (React Email components)

**`convex/otp/`:**
- Purpose: OTP-based email authentication provider
- Contains: `ResendOTP.ts` (provider config), `VerificationCodeEmail.tsx` (email template)

**`src/routes/`:**
- Purpose: TanStack Router file-based routing
- Contains: Route components organized by URL hierarchy
- Auto-generates `src/routeTree.gen.ts` from file structure

**`src/ui/`:**
- Purpose: Shared, reusable UI components (design system primitives)
- Contains: Radix UI wrappers, form elements, layout components, custom hooks
- NOT feature-specific components (those go in route directories with `-ui.` prefix)

**`src/utils/`:**
- Purpose: Shared utility functions and validators
- Contains: CSS helpers (`cn`), custom hooks (`useSignOut`), Zod schemas

**`src/types/`:**
- Purpose: TypeScript type declarations and module augmentations
- Contains: Third-party module declarations

**`public/`:**
- Purpose: Static files served directly by Vite
- Contains: Images, i18n translation JSON files

## Key File Locations

**Entry Points:**
- `index.html`: Vite HTML entry, loads `src/main.tsx`
- `src/main.tsx`: ReactDOM.createRoot, renders `<App />`
- `src/app.tsx`: Provider tree (Convex, React Query, Router, Helmet, i18n)
- `src/router.tsx`: TanStack Router instance creation
- `convex/http.ts`: HTTP endpoint entry (Stripe webhooks + auth routes)

**Configuration:**
- `vite.config.ts`: Vite plugins (TanStack Router, React, Tailwind), path aliases
- `vitest.config.ts`: Test config (jsdom for frontend, edge-runtime for convex)
- `tsconfig.app.json`: Main TypeScript config with path aliases
- `convex/tsconfig.json`: Convex-specific TypeScript config
- `eslint.config.js`: ESLint flat config
- `site.config.ts`: Site metadata (title, description, URLs)
- `convex/auth.config.ts`: Auth provider configuration
- `convex/env.ts`: Server-side environment variable exports

**Core Logic (Backend):**
- `convex/app.ts`: User queries/mutations (getCurrentUser, updateUsername, completeOnboarding, etc.)
- `convex/stripe.ts`: Stripe integration (customer creation, subscriptions, checkout, portal)
- `convex/schema.ts`: Database schema + domain constants (PLANS, CURRENCIES, INTERVALS)
- `convex/auth.ts`: Auth provider setup (GitHub OAuth + Resend OTP)
- `convex/init.ts`: Database seeding (Stripe products and plans)

**Core Logic (Frontend):**
- `src/routes/_app.tsx`: Pathless layout that ensures user data is loaded
- `src/routes/_app/_auth.tsx`: Auth guard (redirects unauthenticated users to /login)
- `src/routes/_app/_auth/dashboard/_layout.tsx`: Dashboard shell with navigation
- `src/routes/_app/_auth/dashboard/-ui.navigation.tsx`: Dashboard-scoped navigation component

**Shared Types:**
- `types.ts`: Root-level shared types (User type combining Doc<"users"> + subscription)
- `errors.ts`: Centralized error message constants

**Testing:**
- `src/test-helpers.tsx`: `renderWithRouter()` for integration tests
- `src/test-setup.ts`: Vitest global setup
- `convex/test.setup.ts`: Backend test setup

## Naming Conventions

**Files:**
- Route files: `_layout.tsx` for layout routes, `_layout.{segment}.tsx` for child routes (e.g., `_layout.settings.billing.tsx`)
- Pathless layout routes: Prefixed with underscore `_` (e.g., `_app.tsx`, `_auth.tsx`)
- Route-scoped UI: Prefixed with `-ui.` (e.g., `-ui.navigation.tsx`) -- TanStack Router ignores files starting with `-`
- Test files: `{name}.test.ts` or `{name}.test.tsx` (co-located with source)
- Components: lowercase kebab-case (e.g., `dropdown-menu.tsx`, `theme-switcher.tsx`)
- Hooks: `use-{name}.ts` (e.g., `use-double-check.ts`)
- Utility files: lowercase (e.g., `misc.ts`, `validators.ts`)
- Backend utilities: Separated by concern (e.g., `button-util.ts` extracts non-JSX logic from `button.tsx`)

**Directories:**
- Feature directories under routes match URL segments: `dashboard/`, `onboarding/`, `login/`
- Lowercase, no hyphens for route directories

**Convex function naming:**
- `PREAUTH_` prefix: Internal functions that receive a userId (caller must authorize first)
- `UNAUTH_` prefix: Internal functions that need no authorization
- No prefix: Public-facing queries/mutations/actions

## Path Aliases

Three aliases are configured in `vite.config.ts`, `vitest.config.ts`, and `tsconfig.app.json`:

| Alias | Resolves To | Use For |
|-------|-------------|---------|
| `@/` | `./src/` | Frontend source imports |
| `@cvx/` | `./convex/` | Convex backend imports |
| `~/` | `./` (project root) | Root-level files (`errors.ts`, `types.ts`, `site.config.ts`) |

**Examples:**
```typescript
import { cn } from "@/utils/misc";           // src/utils/misc.ts
import { api } from "@cvx/_generated/api";    // convex/_generated/api
import { ERRORS } from "~/errors";            // errors.ts
import { User } from "~/types";               // types.ts
```

## URL Route Map

| URL Path | Route File | Purpose |
|----------|-----------|---------|
| `/` | `src/routes/index.tsx` | Landing page |
| `/login` | `src/routes/_app/login/_layout.index.tsx` | Login form |
| `/onboarding` | `src/routes/_app/_auth/onboarding/_layout.tsx` | Onboarding shell |
| `/onboarding/username` | `src/routes/_app/_auth/onboarding/_layout.username.tsx` | Username step |
| `/dashboard` | `src/routes/_app/_auth/dashboard/_layout.index.tsx` | Dashboard home |
| `/dashboard/checkout` | `src/routes/_app/_auth/dashboard/_layout.checkout.tsx` | Post-checkout confirmation |
| `/dashboard/settings` | `src/routes/_app/_auth/dashboard/_layout.settings.index.tsx` | General settings |
| `/dashboard/settings/billing` | `src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx` | Billing/subscription settings |

**Route hierarchy:**
```
__root (Helmet, devtools)
├── / (landing page)
└── _app (loads user data via beforeLoad)
    ├── _auth (auth guard - redirects to /login if unauthenticated)
    │   ├── /dashboard/_layout (nav + header shell)
    │   │   ├── / (dashboard index)
    │   │   ├── /checkout
    │   │   └── /settings/_layout (settings sidebar)
    │   │       ├── / (general settings)
    │   │       └── /billing
    │   └── /onboarding/_layout (onboarding shell)
    │       └── /username
    └── /login/_layout (split-screen login shell)
        └── / (login form)
```

## Where to Add New Code

**New authenticated page (e.g., /dashboard/analytics):**
1. Create route file: `src/routes/_app/_auth/dashboard/_layout.analytics.tsx`
2. Create test file: `src/routes/_app/_auth/dashboard/_layout.analytics.test.tsx`
3. The route tree auto-regenerates on `convex dev` / `vite dev`

**New public page (e.g., /pricing):**
1. Create route file: `src/routes/pricing.tsx` (or `src/routes/_app/pricing/_layout.tsx` for layouts)

**New dashboard-scoped UI component:**
1. Place in the route directory with `-ui.` prefix: `src/routes/_app/_auth/dashboard/-ui.{name}.tsx`
2. This prefix tells TanStack Router to ignore the file as a route

**New shared UI component:**
1. Create: `src/ui/{component-name}.tsx`
2. If the component has non-JSX utilities (like variant definitions), extract to `src/ui/{component-name}-util.ts`
3. Create test: `src/ui/{component-name}.test.tsx`

**New utility function:**
1. Add to `src/utils/misc.ts` if general purpose
2. Create new file `src/utils/{name}.ts` if it's a distinct concern
3. Create test: `src/utils/{name}.test.ts`

**New Zod validator:**
1. Add to `src/utils/validators.ts`
2. Add test to `src/utils/validators.test.ts`

**New Convex backend function:**
1. Add to existing file if related (e.g., user-related goes in `convex/app.ts`)
2. Create new file `convex/{feature}.ts` for a new domain
3. Create test: `convex/{feature}.test.ts`
4. For internal scheduled functions, use `PREAUTH_` or `UNAUTH_` prefix

**New database table:**
1. Add table definition in `convex/schema.ts`
2. Run `convex dev` to regenerate types in `convex/_generated/`

**New email template:**
1. Create: `convex/email/templates/{name}.tsx` (React Email component)

**New translation:**
1. Add keys to `public/locales/en/translation.json`
2. Add translations to `public/locales/es/translation.json`

**New shared TypeScript type:**
1. If it combines Convex Doc types or is used cross-boundary: add to `types.ts`
2. If it's domain-specific to a single file: keep it local

**New error message:**
1. Add to `errors.ts` in the `ERRORS` object under the appropriate category

## Special Directories

**`convex/_generated/`:**
- Purpose: Auto-generated Convex API types and server bindings
- Generated: Yes (by `convex dev` / `convex deploy`)
- Committed: Yes
- Never edit manually

**`src/routeTree.gen.ts`:**
- Purpose: Auto-generated TanStack Router route tree
- Generated: Yes (by TanStack Router Vite plugin)
- Committed: Yes
- Never edit manually

**`.tanstack/tmp/`:**
- Purpose: TanStack Router temporary files
- Generated: Yes
- Committed: No (in .gitignore)

**`coverage/`:**
- Purpose: Test coverage reports (lcov, JSON summary)
- Generated: Yes (by `vitest run --coverage`)
- Committed: Appears committed but should not be

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (by `vite build`)
- Committed: Appears committed but should not be

---

*Structure analysis: 2026-03-09*
