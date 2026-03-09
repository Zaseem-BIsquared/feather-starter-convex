# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**
- TypeScript ^5.9.3 - Used throughout (frontend, backend, config)
- TSX - React components and email templates

**Secondary:**
- CSS (Tailwind v4) - Styling via `src/index.css`

## Runtime

**Environment:**
- Node.js (ES2022 target, ESNext modules)
- Convex runtime (edge-runtime for backend functions)
- Browser (DOM, DOM.Iterable libs)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React ^19.2.4 - UI framework
- Convex ^1.32.0 - Backend-as-a-service (database, functions, file storage, scheduling)
- TanStack Router ^1.166.3 - File-based routing with type-safe navigation
- TanStack React Query ^5.90.21 - Server state management (bridged to Convex via `@convex-dev/react-query`)
- TanStack React Form ^1.28.4 - Form state management

**Testing:**
- Vitest ^4.0.18 - Test runner
- @vitest/coverage-v8 ^4.0.18 - Code coverage (V8 provider)
- @testing-library/react ^16.3.2 - React component testing
- @testing-library/jest-dom ^6.9.1 - DOM assertion matchers
- @testing-library/user-event ^14.6.1 - User interaction simulation
- convex-test ^0.0.41 - Convex backend function testing
- feather-testing-convex ^0.5.0 - Custom Convex test provider plugin
- jsdom ^28.1.0 - Browser environment for frontend tests

**Build/Dev:**
- Vite ^7.3.1 - Build tool and dev server
- @vitejs/plugin-react ^5.1.4 - React Fast Refresh for Vite
- @tailwindcss/vite ^4.2.1 - Tailwind CSS v4 Vite plugin
- @tanstack/router-plugin ^1.166.3 - TanStack Router code generation for Vite
- npm-run-all ^4.1.5 - Parallel script runner (frontend + backend dev)

## Key Dependencies

**Critical:**
- `convex` ^1.32.0 - Entire backend platform (database, serverless functions, file storage, real-time subscriptions)
- `stripe` ^16.6.0 - Payment processing, subscription management, checkout sessions, customer portal
- `@convex-dev/auth` ^0.0.91 - Authentication layer on top of Convex (GitHub OAuth, email OTP)
- `@auth/core` ^0.41.1 - Auth.js core (provides OAuth provider implementations like GitHub)
- `resend` ^6.9.3 - Transactional email delivery (OTP codes, subscription notifications)

**Infrastructure:**
- `convex-helpers` ^0.1.114 - Utility functions for Convex (e.g., `asyncMap`)
- `zod` ^4.3.6 - Runtime schema validation (webhook payloads, API responses)
- `oslo` ^1.2.1 - Cryptographic utilities (OTP code generation via `oslo/crypto`)
- `@react-email/components` ^1.0.8 + `@react-email/render` ^2.0.4 - Email template rendering with React components

**UI:**
- `@radix-ui/react-dropdown-menu` ^2.1.1 - Accessible dropdown menus
- `@radix-ui/react-select` ^2.1.1 - Accessible select inputs
- `@radix-ui/react-slot` ^1.1.0 - Polymorphic component composition
- `@radix-ui/react-switch` ^1.1.0 - Toggle switch component
- `class-variance-authority` ^0.7.0 - Component variant management (CVA)
- `clsx` ^2.1.1 + `tailwind-merge` ^2.4.0 - Conditional class merging
- `lucide-react` ^0.577.0 - Icon library
- `tw-animate-css` ^1.4.0 - Tailwind animation utilities
- `react-dropzone` ^15.0.0 - File upload drag-and-drop
- `@xixixao/uploadstuff` ^0.0.5 - Convex file upload integration

**Internationalization:**
- `i18next` ^23.12.2 - i18n framework
- `react-i18next` ^15.0.0 - React bindings for i18next
- `i18next-browser-languagedetector` ^8.0.0 - Auto-detect user language
- `i18next-http-backend` ^2.5.2 - Load translations from `/public/locales/`

**SEO:**
- `react-helmet-async` ^2.0.5 - Document head management

## Configuration

**TypeScript:**
- Three tsconfig files: `tsconfig.json` (project references), `tsconfig.app.json` (frontend + convex), `tsconfig.node.json` (Vite config)
- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Target: ES2022, Module: ESNext, JSX: react-jsx

**Path Aliases (defined in `tsconfig.app.json` and `vite.config.ts`):**
- `@/*` maps to `./src/*`
- `@cvx/*` maps to `./convex/*`
- `~/*` maps to project root `"./*"`

**Build:**
- `vite.config.ts` - Frontend build with TanStack Router plugin, React plugin, Tailwind plugin
- `vitest.config.ts` - Test config with jsdom for frontend, edge-runtime for Convex backend tests
- `eslint.config.js` - Linting with `eslint-config-prettier`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

**Linting/Formatting:**
- ESLint ^10.0.3 with typescript-eslint ^8.56.1
- Prettier ^3.8.1

**Environment:**
- No `.env` file committed (secrets managed via Convex dashboard)
- Environment variables accessed through `convex/env.ts` (centralized export)
- Frontend env var: `VITE_CONVEX_URL` (set via Vite's `import.meta.env`)

**Site Config:**
- `site.config.ts` - Centralized site metadata (title, description, URL, OG image, favicon, social handles)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start frontend (Vite) + backend (Convex) in parallel |
| `npm run dev:frontend` | Vite dev server only |
| `npm run dev:backend` | Convex dev server only |
| `npm run build` | TypeScript check + Vite production build |
| `npm run typecheck` | Type-check all three tsconfigs |
| `npm run lint` | ESLint |
| `npm run test` | Vitest single run |
| `npm run test:watch` | Vitest watch mode |
| `npm run preview` | Preview production build |

## Platform Requirements

**Development:**
- Node.js (ES2022 compatible)
- Convex CLI (`npx convex dev`)
- Stripe CLI (for webhook testing, optional)

**Production:**
- Convex Cloud (backend hosting, database, file storage)
- Vite-built static frontend (deployable to any static host)
- Stripe account with products/prices configured
- Resend account for transactional email

---

*Stack analysis: 2026-03-09*
