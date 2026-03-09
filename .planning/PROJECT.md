# Feather Starter Convex — Architecture Modernization

## What This Is

A full-stack SaaS starter kit built on React + Convex + Stripe, used both as an open-source boilerplate for other developers and as the foundation for the author's own products. This milestone restructures the codebase to adopt fullproduct.dev core concepts: feature-folder organization, git-based plugins, shared Zod validation, and CLI generators.

## Core Value

Developer velocity — new features are faster to build because every file has a clear, predictable home, and common patterns are automated through generators and shared schemas.

## Requirements

### Validated

- ✓ Email OTP authentication with Resend — existing
- ✓ GitHub OAuth authentication — existing
- ✓ Stripe subscription billing (checkout, portal, webhooks) — existing
- ✓ User profile management (username, avatar upload) — existing
- ✓ Onboarding flow with username setup — existing
- ✓ Dashboard with sidebar navigation — existing
- ✓ i18n support (English, Spanish) — existing
- ✓ Account deletion with Stripe cleanup — existing
- ✓ 100% test coverage (frontend + backend) — existing
- ✓ SEO with react-helmet-async — existing

### Active

- [ ] Feature-folder structure for frontend (`src/features/`)
- [ ] Feature-folder structure for backend (`convex/` by domain)
- [ ] Shared cross-feature code in `src/shared/`
- [ ] Thin route files (routes import from features)
- [ ] Git-based plugin infrastructure (install script, CI, docs)
- [ ] Plugin-friendly shared files (data-driven nav, namespace i18n, error groups)
- [ ] First plugin branches (CI, command palette, admin panel)
- [ ] Shared Zod schemas for client-server validation (`src/shared/schemas/`)
- [ ] Zod validation in Convex mutations (eliminate server-side validation gap)
- [ ] CLI generators via Plop.js (route, feature, convex-function, form)
- [ ] Architecture documentation (PROVIDERS.md, feature READMEs, updated README)

### Out of Scope

- Workspace drivers / backend abstraction layer — Convex is un-abstractable by design
- Universal (web + mobile) — web-only starter kit
- GREEN stack branding — already aligned with the philosophy, no label needed
- Monorepo tooling — using folders within single package, not Turborepo/Nx

## Context

- Codebase currently has a flat structure: `convex/app.ts` is a 200+ line catch-all, route files contain 150+ lines of inline components
- The `convex/email/` and `convex/otp/` directories are already feature-organized — the pattern works, just needs to be applied everywhere
- Tests co-located in `tests/` directory; will move to feature folders alongside source
- Shared types currently live at root level (`types.ts`, `errors.ts`, `site.config.ts`)
- Zod v4 is installed (^4.3.6); convex-helpers Zod v4 compatibility needs verification
- Username validation has a bug: UI says "32 characters max" but Zod enforces `max(20)`

## Constraints

- **Convex schema**: `schema.ts` must remain at convex root (Convex framework requirement)
- **TanStack Router**: Route files must stay in `src/routes/` with their naming convention (framework requirement)
- **API path breakage**: Reorganizing `convex/` changes all `api.*` paths — all frontend `useQuery`/`useMutation` calls must be updated in lockstep
- **Plugin merge conflicts**: Shared files (nav, i18n, errors) must be designed for clean git merges
- **Test coverage**: Must maintain 100% coverage throughout restructure — tests move with their source

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Folders over monorepo | Single package keeps Convex integration simple, avoids tooling overhead | — Pending |
| Break all API paths at once | One-time cost vs incremental migration; cleaner result | — Pending |
| Plop.js for generators | Lightweight, template-based, well-maintained; no lock-in | — Pending |
| Tests co-located with features | Keeps feature folders self-contained; easier to move/delete features | — Pending |
| Zod v4 for shared schemas | Already installed; enables client-server schema sharing | — Pending |
| All 5 phases = one milestone | Interconnected changes; partial adoption leaves awkward in-between state | — Pending |

---
*Last updated: 2026-03-09 after initialization*
