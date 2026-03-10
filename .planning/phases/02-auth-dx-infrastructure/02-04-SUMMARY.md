---
phase: 02-auth-dx-infrastructure
plan: 04
subsystem: testing
tags: [playwright, e2e, convex-test, chromium]

requires:
  - phase: 02-01
    provides: "Password auth backend + login UI (sign up/sign in)"
  - phase: 02-03
    provides: "Password reset flow, dev mailbox route for email verification"
provides:
  - "Playwright E2E test suite covering auth, onboarding, and settings flows"
  - "clearAll mutation for test data cleanup"
  - "Reusable signUp helper for E2E tests"
  - "E2E fixture with Convex auto-cleanup via feather-testing-convex"
affects: [phase-3, phase-4, phase-5, phase-6]

tech-stack:
  added: ["@playwright/test", "feather-testing-convex/playwright"]
  patterns: ["E2E fixtures with createConvexTest", "clearAll mutation for test isolation", "reusable signUp helper across specs"]

key-files:
  created:
    - playwright.config.ts
    - e2e/fixtures.ts
    - e2e/helpers.ts
    - e2e/auth.spec.ts
    - e2e/onboarding.spec.ts
    - e2e/settings.spec.ts
    - convex/testing/clearAll.ts
  modified:
    - package.json
    - vitest.config.ts
    - tsconfig.node.json

key-decisions:
  - "E2E_CONVEX_URL env var with VITE_CONVEX_URL fallback for developer convenience"
  - "Chromium-only for faster local E2E runs"
  - "E2E verification deferred — user skipped checkpoint (Task 3) due to time constraints"

patterns-established:
  - "E2E test pattern: import test/expect from e2e/fixtures, use signUp helper from e2e/helpers"
  - "Test isolation: clearAll mutation wipes all tables between tests via fixture afterEach"

requirements-completed: [DX-03]

duration: 3min
completed: 2026-03-10
---

# Phase 2 Plan 4: Playwright E2E Tests Summary

**Playwright E2E test suite with auth/onboarding/settings specs, Convex test fixtures, and clearAll cleanup mutation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T04:10:00Z
- **Completed:** 2026-03-10T04:14:00Z
- **Tasks:** 2 of 3 (Task 3 checkpoint deferred by user)
- **Files modified:** 11

## Accomplishments
- Playwright installed and configured with Chromium, Vite dev server auto-start, and 30s timeout
- clearAll mutation deletes all rows from all tables (users, plans, subscriptions, devEmails, auth tables) for test isolation
- E2E fixtures using feather-testing-convex/playwright with auto-cleanup between tests
- Auth E2E specs: sign up, sign in, sign out, password reset (with dev mailbox code extraction)
- Onboarding E2E specs: username flow, skip for returning users
- Settings E2E specs: profile settings page, billing page load verification
- Reusable signUp helper shared across all spec files

## Task Commits

Each task was committed atomically:

1. **Task 1: Playwright setup + clearAll mutation + auth E2E tests** - `90987d2` (feat)
2. **Task 2: Onboarding + settings E2E tests** - `1f65f34` (feat)
3. **Task 3: Verify E2E test suite passes** - DEFERRED (checkpoint skipped by user)

## Files Created/Modified
- `playwright.config.ts` - Playwright config (Chromium, Vite webServer, 30s timeout)
- `e2e/fixtures.ts` - Test fixtures with createConvexTest and auto-cleanup
- `e2e/helpers.ts` - Reusable signUp helper function
- `e2e/auth.spec.ts` - Auth flow E2E tests (sign up, sign in, sign out, password reset)
- `e2e/onboarding.spec.ts` - Onboarding flow E2E tests
- `e2e/settings.spec.ts` - Settings and billing E2E tests
- `convex/testing/clearAll.ts` - Mutation to wipe all tables for test cleanup
- `package.json` - Added test:e2e script and Playwright dependency
- `vitest.config.ts` - Excluded convex/testing from coverage
- `tsconfig.node.json` - Added e2e paths for type checking
- `package-lock.json` - Lockfile update

## Decisions Made
- E2E_CONVEX_URL with VITE_CONVEX_URL fallback for convenience during development
- Chromium-only browser target for faster local runs
- Task 3 (E2E verification checkpoint) deferred at user request — tests written but not yet run against a live deployment

## Deviations from Plan

### Deferred Checkpoint

**Task 3: Verify E2E test suite passes** was a `checkpoint:human-verify` task requiring the user to run the full E2E suite against a separate Convex deployment. User requested to skip this verification due to time constraints. The E2E test specs are complete and type-check successfully, but have not been executed against a live environment.

**Impact:** Tests may need adjustments when first run against a real deployment. No code is missing — only runtime verification is deferred.

## Issues Encountered
None during implementation.

## User Setup Required

**External services require manual configuration** before E2E tests can run:
- Create a separate Convex project for E2E testing (e.g., "feather-starter-e2e")
- Set `E2E_CONVEX_URL` environment variable to the E2E deployment URL
- Run `npx playwright install chromium` if not already installed
- Run `npm run test:e2e` to execute the suite

## Next Phase Readiness
- E2E test infrastructure is in place for all future phases
- New features can add E2E specs following the established pattern (fixtures + signUp helper)
- Phase 2 is now complete — ready for Phase 3 (Tasks)
- **Deferred:** E2E runtime verification should be done before relying on tests as a safety net

## Self-Check: PASSED

All 6 created files verified on disk. Both task commits (90987d2, 1f65f34) verified in git log.

---
*Phase: 02-auth-dx-infrastructure*
*Completed: 2026-03-10*
