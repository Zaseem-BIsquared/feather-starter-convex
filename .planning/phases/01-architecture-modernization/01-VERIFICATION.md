---
phase: 01-architecture-modernization
verified: 2026-03-09T18:00:00Z
status: gaps_found
score: 5/7 success criteria verified
re_verification: false
gaps:
  - truth: "Shared Zod schemas validate on both client and server; the username max-length bug is fixed"
    status: partial
    reason: "Zod schemas exist (VAL-01) and username bug is fixed (VAL-03), but Convex mutations do NOT validate with Zod via convex-helpers/server/zod4 (VAL-02 failed). Convex validators are NOT derived from Zod schemas (VAL-04 failed). Mutations use standard Convex mutation() with native v.string() validators -- no zCustomMutation usage anywhere."
    artifacts:
      - path: "convex/users/mutations.ts"
        issue: "Uses mutation() with v.string(), not zCustomMutation with Zod schema"
      - path: "convex/onboarding/mutations.ts"
        issue: "Uses mutation() with native validators, not Zod validation"
      - path: "convex/schema.ts"
        issue: "Validators defined independently as v.union/v.literal, not derived from Zod schemas via zodToConvex"
    missing:
      - "Wire convex-helpers/server/zod4 zCustomMutation into user and onboarding mutations"
      - "Derive Convex validators from Zod schemas using zodToConvex where supported"
  - truth: "npm run typecheck and npm test pass with 100% coverage throughout"
    status: partial
    reason: "npm test passes (160 tests, 100% coverage). However, npm run typecheck fails with 8 errors in route test files (vi not found, focus on Element, unused variables). The SUMMARY claims these are pre-existing but they still violate the success criterion as stated."
    artifacts:
      - path: "src/routes/_app/_auth/dashboard/_layout.checkout.test.tsx"
        issue: "TS2304: Cannot find name 'vi' (3 errors)"
      - path: "src/routes/_app/_auth/dashboard/_layout.settings.billing.test.tsx"
        issue: "TS2339 focus on Element, TS6133 unused variables (4 errors)"
      - path: "src/routes/_app/_auth/dashboard/_layout.settings.index.test.tsx"
        issue: "TS6133 unused variable (1 error)"
    missing:
      - "Fix typecheck errors in route test files (add vitest types, cast Element to HTMLElement, remove unused vars)"
---

# Phase 1: Architecture Modernization Verification Report

**Phase Goal:** The starter kit has a feature-folder architecture with shared validation, a working plugin system with three plugin branches, CLI generators, and architecture documentation
**Verified:** 2026-03-09T18:00:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Convex functions live in domain folders and all api.* imports resolve; frontend code lives in src/features/ with thin route wrappers | VERIFIED | 4 domain folders exist (users/, billing/, uploads/, onboarding/). 6 feature folders exist. All 5 page routes are thin wrappers (10-20 lines). Zero stale api.app.* or api.stripe.* references. |
| 2 | Shared Zod schemas validate on both client and server; the username max-length bug is fixed | PARTIAL | Zod schemas exist in src/shared/schemas/ (username, billing). USERNAME_MAX_LENGTH constant used dynamically in SettingsPage.tsx. BUT: mutations use standard Convex mutation() NOT zCustomMutation. No zodToConvex derivation. VAL-02 and VAL-04 not satisfied. |
| 3 | Navigation is data-driven, i18n uses namespace-based loading, and error constants are grouped by feature | VERIFIED | navItems array in src/shared/nav.ts drives Navigation tab bar. i18n uses ns array with per-feature JSON files (12 files, 6 per locale). ERRORS grouped by domain (auth, onboarding, billing, common). Old translation.json deleted. |
| 4 | scripts/plugin.sh can list/install plugins; three plugin branches exist and a two-plugin merge succeeds | VERIFIED | plugin.sh works with list/preview/install. 3 local plugin branches exist. 2 pushed to remote (infra-ci local only due to OAuth scope). Multi-plugin merge documented with one trivial i18n conflict. |
| 5 | Four CLI generators (gen:feature, gen:route, gen:convex-function, gen:form) scaffold correct files | VERIFIED | plopfile.js has 4 generators. package.json has 4 gen:* scripts. Templates exist in templates/ directory. Feature generator creates 7 files (frontend + backend). |
| 6 | README, PROVIDERS.md, and per-feature READMEs document the architecture | VERIFIED | README.md (315 lines), PROVIDERS.md (106 lines), 6 per-feature READMEs (29-36 lines each) all exist with real content. |
| 7 | npm run typecheck and npm test pass with 100% coverage throughout | PARTIAL | 160 tests pass, 100% coverage thresholds met. But typecheck fails with 8 errors in 3 route test files (pre-existing but still present). |

**Score:** 5/7 success criteria verified (2 partial)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `convex/users/queries.ts` | getCurrentUser query | VERIFIED | Exists, 1007 bytes, exports getCurrentUser |
| `convex/users/mutations.ts` | User mutations with Zod validation | PARTIAL | Exists with 4 mutations, but uses native v.string() not Zod |
| `convex/billing/queries.ts` | Billing queries | VERIFIED | Exists, exports getActivePlans |
| `convex/billing/actions.ts` | Stripe actions | VERIFIED | Exists, 2542 bytes |
| `convex/billing/stripe.ts` | Stripe SDK + internals | VERIFIED | Exists, 9851 bytes |
| `convex/uploads/mutations.ts` | Upload mutations | VERIFIED | Exists, exports generateUploadUrl |
| `convex/onboarding/mutations.ts` | Onboarding mutations with Zod | PARTIAL | Exists but uses native mutation(), not zCustomMutation |
| `src/shared/schemas/billing.ts` | Currency, interval, planKey | VERIFIED | Zod schemas with enum values matching convex/schema.ts |
| `src/shared/schemas/username.ts` | Username schema + constant | VERIFIED | USERNAME_MAX_LENGTH exported and used |
| `src/shared/nav.ts` | NavItem + navItems array | VERIFIED | 3 nav items, NavItem interface exported |
| `src/shared/errors.ts` | Feature-grouped ERRORS | VERIFIED | 4 groups (auth, onboarding, billing, common) |
| `src/i18n.ts` | Namespace-based config | VERIFIED | ns array, defaultNS, loadPath with {{ns}} |
| `scripts/plugin.sh` | Plugin management | VERIFIED | list/preview/install, executable |
| `plopfile.js` | 4 generators | VERIFIED | feature, route, convex-function, form |
| `PROVIDERS.md` | Vendor swap guides | VERIFIED | 106 lines covering Convex, Resend, Stripe, GitHub OAuth, Vercel |
| `README.md` | Comprehensive docs | VERIFIED | 315 lines with architecture diagram, plugin docs, generator docs |
| `src/features/*/README.md` | Per-feature docs | VERIFIED | All 6 exist with Purpose, Backend, Key Files, Dependencies sections |
| `src/features/dashboard/index.ts` | Barrel export | VERIFIED | Exports DashboardPage, Navigation |
| `src/features/billing/index.ts` | Barrel export | VERIFIED | Exports CheckoutPage, BillingSettings |
| `src/features/settings/index.ts` | Barrel export | VERIFIED | Exports SettingsPage |
| `src/features/onboarding/index.ts` | Barrel export | VERIFIED | Exports UsernamePage |
| `src/features/auth/index.ts` | Barrel export | VERIFIED | Skeleton (auth UI minimal) |
| `src/features/uploads/index.ts` | Barrel export | VERIFIED | Skeleton (uploads embedded) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Route _layout.index.tsx | @/features/dashboard | import DashboardPage | WIRED | Line 2 imports from @/features/dashboard |
| Route _layout.settings.index.tsx | @/features/settings | import SettingsPage | WIRED | Line 2 imports from @/features/settings |
| Route _layout.username.tsx | @/features/onboarding | import UsernamePage | WIRED | Line 2 imports from @/features/onboarding |
| Route _layout.checkout.tsx | @/features/billing | import CheckoutPage | WIRED | Line 2 imports from @/features/billing |
| Route _layout.settings.billing.tsx | @/features/billing | import BillingSettings | WIRED | Line 2 imports from @/features/billing |
| Navigation.tsx | src/shared/nav.ts | import navItems | WIRED | Line 26 imports, line 215 maps over array |
| src/i18n.ts | public/locales/{{lng}}/{{ns}}.json | loadPath | WIRED | loadPath configured, 12 namespace files exist |
| convex/users/mutations.ts | src/shared/schemas/username.ts | zCustomMutation with Zod | NOT_WIRED | No import of Zod schema in mutations file |
| package.json | plopfile.js | gen:* scripts | WIRED | 4 scripts defined pointing to plop generators |
| plopfile.js | templates/ | templateFile references | WIRED | 14 template files referenced, all exist |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STRUCT-01 | 01-03 | Frontend feature folders | SATISFIED | 6 feature folders with components/, hooks/, index.ts |
| STRUCT-02 | 01-02 | Convex backend by domain | SATISFIED | 4 domain folders (users/, billing/, uploads/, onboarding/) |
| STRUCT-03 | 01-01 | Cross-feature code in src/shared/ | SATISFIED | schemas/, nav.ts, errors.ts in src/shared/ |
| STRUCT-04 | 01-03, 01-04 | Route files are thin wrappers | SATISFIED | All 5 routes 10-20 lines, import from features |
| STRUCT-05 | 01-04 | Tests co-located in feature folders | SATISFIED | dashboard.test.tsx, billing.test.tsx, settings.test.tsx, onboarding.test.tsx in feature dirs |
| STRUCT-06 | 01-02 | All api.* paths updated | SATISFIED | Zero references to api.app.* or api.stripe.* |
| STRUCT-07 | 01-01 | vitest coverage uses globs | SATISFIED | coverage.include uses glob patterns |
| STRUCT-08 | 01-02 | TypeScript + tests pass after restructure | PARTIAL | Tests pass (160/160). Typecheck has 8 pre-existing errors in route test files. |
| VAL-01 | 01-02 | Shared Zod schemas | SATISFIED | username.ts, billing.ts in src/shared/schemas/ |
| VAL-02 | 01-02 | Convex mutations validate with Zod | NOT SATISFIED | Mutations use standard mutation() with v.string(), no zCustomMutation |
| VAL-03 | 01-02 | Username max-length bug fixed | SATISFIED | USERNAME_MAX_LENGTH constant used in SettingsPage.tsx, no hardcoded "32 character" refs |
| VAL-04 | 01-02 | Convex validators derived from Zod | NOT SATISFIED | convex/schema.ts defines validators independently, no zodToConvex usage |
| PLUG-01 | 01-05 | Data-driven navigation | SATISFIED | navItems array, Navigation maps over it |
| PLUG-02 | 01-05 | Namespace-based i18n | SATISFIED | 6 namespaces, loadPath with {{ns}} |
| PLUG-03 | 01-05 | Feature-grouped errors | SATISFIED | ERRORS object grouped by auth/onboarding/billing/common |
| PLUG-04 | 01-06 | Plugin management script | SATISFIED | scripts/plugin.sh with list/preview/install |
| PLUG-05 | 01-06 | Auto-rebase GitHub Action | SATISFIED | rebase-plugins.yml on plugin/infra-ci-github-actions branch (local only) |
| PLUG-06 | 01-06 | Plugin CI workflow | SATISFIED | plugin-ci.yml on plugin/infra-ci-github-actions branch (local only) |
| PLUG-07 | 01-06 | infra-ci plugin branch | SATISFIED | Branch exists locally with 2 workflow files |
| PLUG-08 | 01-06 | command-palette plugin | SATISFIED | Branch exists (local + remote) with cmdk component |
| PLUG-09 | 01-06 | admin-panel plugin | SATISFIED | Branch exists (local + remote) with full CRUD |
| PLUG-10 | 01-06 | Multi-plugin merge tested | SATISFIED | Documented: 1 trivial i18n conflict |
| GEN-01 | 01-07 | gen:feature scaffolds files | SATISFIED | Plop generator creates 7 files |
| GEN-02 | 01-07 | gen:route creates route file | SATISFIED | Auth/public route templates |
| GEN-03 | 01-07 | gen:convex-function generates function | SATISFIED | query/mutation/action templates |
| GEN-04 | 01-07 | gen:form generates schema + component | SATISFIED | schema.ts.hbs + form.tsx.hbs |
| DOC-01 | 01-07 | PROVIDERS.md with swap guides | SATISFIED | 106 lines, 5 vendors documented |
| DOC-02 | 01-07 | Comprehensive README | SATISFIED | 315 lines with Mermaid diagram |
| DOC-03 | 01-07 | Per-feature READMEs | SATISFIED | 6 README.md files with consistent template |

**Requirements Summary:** 26/29 satisfied, 1 partial, 2 not satisfied

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| convex/billing/stripe.ts | 16 | TODO comment | Info | Pre-existing comment about Stripe key configuration |
| src/shared/schemas/billing.ts | 7 | "kept in sync with convex/schema.ts" | Warning | Manual sync instead of derived validators -- fragile |
| REQUIREMENTS.md | all | All boxes checked [x] | Warning | Requirements marked complete in REQUIREMENTS.md but VAL-02 and VAL-04 are not actually implemented |

### Human Verification Required

### 1. Plugin Branch Merge End-to-End

**Test:** Run `bash scripts/plugin.sh install plugin/ui-command-palette` then `bash scripts/plugin.sh install plugin/feature-admin-panel` on a test branch
**Expected:** Both plugins integrate cleanly with at most one trivial i18n conflict
**Why human:** Merge behavior depends on git state and may have side effects

### 2. Command Palette Functionality

**Test:** On the command-palette plugin branch, start dev server. Press Cmd+K.
**Expected:** Command palette opens, shows nav items from navItems array, keyboard selection navigates
**Why human:** Runtime UI behavior, keyboard shortcuts, visual appearance

### 3. Admin Panel CRUD Operations

**Test:** On the admin-panel plugin branch, start dev server. Navigate to admin panel.
**Expected:** User table displays, role toggle works, enable/disable toggle works, admin guard blocks non-admin users
**Why human:** Full CRUD flow requires running Convex backend with real data

### 4. i18n Namespace Loading

**Test:** Start dev server, navigate through features. Open network tab.
**Expected:** Namespace JSON files loaded on demand (not all at once), no missing translation warnings in console
**Why human:** Runtime loading behavior, network waterfall analysis

### 5. Push infra-ci Branch

**Test:** Push `plugin/infra-ci-github-actions` branch to remote with a token that has workflow scope
**Expected:** Branch pushes successfully, GitHub Actions workflows appear in Actions tab
**Why human:** Requires GitHub token with specific permissions

### Gaps Summary

Two requirements are unmet:

1. **VAL-02 (Convex mutations validate with Zod):** The plan and summary both claim Zod validation was added to mutations via `zCustomMutation`, but the actual code shows standard Convex `mutation()` with native `v.string()` validators. No `convex-helpers/server/zod4` import exists anywhere in the codebase. This means frontend Zod validation and backend Convex validation are separate, duplicated systems rather than shared schemas driving both.

2. **VAL-04 (Convex validators derived from Zod):** The billing Zod schemas in `src/shared/schemas/billing.ts` and the Convex validators in `convex/schema.ts` are independently defined with matching values but no code connecting them. There is no `zodToConvex` usage. A comment in billing.ts says "Values are kept in sync with convex/schema.ts" -- this is manual sync, not derived.

Additionally, **typecheck fails** with 8 errors in route test files. While likely pre-existing, the success criterion "npm run typecheck passes" is not met.

**Root cause:** Plans 01-02 claimed to add Zod validation to mutations (Task 4 in the plan mentions `zCustomMutation`) but the plan's Task 2/3 split the files without adding Zod, and the summary incorrectly marked VAL-02 and VAL-04 as completed.

---

_Verified: 2026-03-09T18:00:00Z_
_Verifier: Claude (gsd-verifier)_
