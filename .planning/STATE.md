---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: CalmDo Core
status: in-progress
last_updated: "2026-03-10T09:06:00Z"
last_activity: 2026-03-10 -- Completed plan 02.1-01 (Stripe extraction from core)
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 6
  completed_plans: 5
  percent: 83
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-10)

**Core value:** Developer velocity -- new features are faster to build because every file has a clear, predictable home
**Current focus:** v2.0 CalmDo Core -- Phase 02.1 (Stripe Plugin Extraction)

## Current Position

Phase: 02.1 of 6 (Stripe Plugin Extraction)
Plan: 1 of 2 complete
Status: Plan 02.1-01 complete, ready for Plan 02.1-02
Last activity: 2026-03-10 -- Completed plan 02.1-01 (Stripe extraction from core)

Progress: [████████░░] 83% (Phase 02.1)

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 9
- Average duration: 4.6min/plan
- Total execution time: 41min
- Commits: 65 | Files changed: 181 | Lines: +17,820 / -5,335

**v2.0 Velocity:**
- Total plans completed: 5
- Average duration: 10.8min/plan
- Total execution time: 54min

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 02.1 | 01 | 10min | 2 | 48 |

## Accumulated Context

### Decisions

See: .planning/PROJECT.md Key Decisions table (updated after v2.0 start)

Recent:
- Vertical slices only (schema+backend+frontend+tests per phase)
- Skip org layer for v2.0 (user-scoped tasks)
- Coarse granularity: 5 phases for 49 requirements
- Re-enabled convex/tsconfig.json in pre-commit typecheck (TS2554 fixed by billing removal)
- Removed --dangerouslyIgnoreUnhandledErrors (Stripe rejections no longer occur)
- Password provider uses named import { Password } (not default export)
- Reset provider id "password-reset" to avoid collision with "resend-otp"
- convex/tsconfig.json lib upgraded ES2021 -> ES2023 for Error cause support
- Login page restructured: password primary, OTP and GitHub as alternatives
- Used public mutations for devEmails (ConvexHttpClient cannot call internal functions)
- DEV_MAILBOX env var defaults to enabled; only "false" disables interception
- Email interception stores plain HTML with token/expiry (not rendered React components)
- E2E_CONVEX_URL env var with VITE_CONVEX_URL fallback for dev convenience
- Chromium-only for faster local E2E runs
- E2E verification checkpoint deferred (Task 3 of 02-04) -- tests written but not yet run against live deployment
- Kept predev script with no-op init.ts (enables plugin override, runs in <1s)
- Added password/password-reset to auth provider cleanup in deleteCurrentUserAccount

### Pending Todos

- [ ] **Post-Phase 2: Review feedback triage** -- After Phase 2 completes, review `docs/REVIEW-FEEDBACK.md` and act on items:
  - P1: Design `feather install <module>` CLI (unified installer replacing all generators)
  - P3: Fix 6 confirmed bugs (missing awaits, silent auth errors, username uniqueness, race condition, hardcoded providers, unused args)
  - P4: Code quality improvements (15 items -- auth guards, error constants, shim cleanup, etc.)
  - P5: Capture architecture proposals for post-v2.0 (event system, permissions, platform/modules split)

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: Stripe Plugin Extraction (URGENT) -- Stripe blocks team in India from running the starter; extract as optional plugin
- Plan 02.1-01 completed: core is billing-free, all tests pass at 100%

### Blockers/Concerns

None.

### Tech Debt (carried forward)

- NavItem.i18nKey defined but unused (designed deferral -- resolves when i18n-aware nav rendering is built)
- convex/_generated/api.d.ts still references billing modules (will auto-update on next `convex dev` run)
