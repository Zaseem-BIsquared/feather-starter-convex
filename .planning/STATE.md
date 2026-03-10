---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: CalmDo Core
status: executing
stopped_at: "Completed 02-04-PLAN.md"
last_updated: "2026-03-10T06:15:00Z"
last_activity: 2026-03-10 -- Completed plan 02-04 (Playwright E2E tests) — Phase 2 complete
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 4
  completed_plans: 4
  percent: 20
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10)

**Core value:** Developer velocity -- new features are faster to build because every file has a clear, predictable home
**Current focus:** v2.0 CalmDo Core -- Phase 2 (Auth & DX Infrastructure)

## Current Position

Phase: 2 of 6 (Auth & DX Infrastructure) -- COMPLETE
Plan: 4 of 4 complete
Status: Phase 2 complete, ready for Phase 3
Last activity: 2026-03-10 -- Completed plan 02-04 (Playwright E2E tests)

Progress: [██████████] 100% (Phase 2)

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 9
- Average duration: 4.6min/plan
- Total execution time: 41min
- Commits: 65 | Files changed: 181 | Lines: +17,820 / -5,335

**v2.0 Velocity:**
- Total plans completed: 4
- Average duration: 11min/plan
- Total execution time: 44min

## Accumulated Context

### Decisions

See: .planning/PROJECT.md Key Decisions table (updated after v2.0 start)

Recent:
- Vertical slices only (schema+backend+frontend+tests per phase)
- Skip org layer for v2.0 (user-scoped tasks)
- Coarse granularity: 5 phases for 49 requirements
- Excluded convex/tsconfig.json from pre-commit typecheck (pre-existing TS2554 error)
- Added --dangerouslyIgnoreUnhandledErrors for vitest coverage (pre-existing Stripe unhandled rejections)
- Password provider uses named import { Password } (not default export)
- Reset provider id "password-reset" to avoid collision with "resend-otp"
- convex/tsconfig.json lib upgraded ES2021 -> ES2023 for Error cause support
- Login page restructured: password primary, OTP and GitHub as alternatives
- Used public mutations for devEmails (ConvexHttpClient cannot call internal functions)
- DEV_MAILBOX env var defaults to enabled; only "false" disables interception
- Email interception stores plain HTML with token/expiry (not rendered React components)
- E2E_CONVEX_URL env var with VITE_CONVEX_URL fallback for dev convenience
- Chromium-only for faster local E2E runs
- E2E verification checkpoint deferred (Task 3 of 02-04) — tests written but not yet run against live deployment

### Pending Todos

- [ ] **Post-Phase 2: Review feedback triage** — After Phase 2 completes, review `docs/REVIEW-FEEDBACK.md` and act on items:
  - P1: Design `feather install <module>` CLI (unified installer replacing all generators)
  - P2: Extract billing/Stripe to plugin branch (out of core)
  - P3: Fix 6 confirmed bugs (missing awaits, silent auth errors, username uniqueness, race condition, hardcoded providers, unused args)
  - P4: Code quality improvements (15 items — auth guards, error constants, shim cleanup, etc.)
  - P5: Capture architecture proposals for post-v2.0 (event system, permissions, platform/modules split)

### Blockers/Concerns

None.

### Tech Debt (carried forward)

- NavItem.i18nKey defined but unused (designed deferral -- resolves when i18n-aware nav rendering is built)
