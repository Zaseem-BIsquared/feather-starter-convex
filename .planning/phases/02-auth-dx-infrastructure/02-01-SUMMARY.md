---
phase: 02-auth-dx-infrastructure
plan: 01
subsystem: auth
tags: [convex-auth, password, email, react-form, resend]

# Dependency graph
requires: []
provides:
  - Password provider registered in Convex Auth (signIn/signUp/reset flows)
  - ResendOTPPasswordReset email provider for password reset (stub, wired in Plan 03)
  - PasswordForm component with signIn/signUp mode toggle
  - Updated login page with password form primary, OTP and GitHub as alternatives
affects: [02-03-password-reset, 02-04-error-handling]

# Tech tracking
tech-stack:
  added: ["@convex-dev/auth/providers/Password", "@oslojs/crypto/random"]
  patterns: [password-auth-flow, v8-ignore-tanstack-form-branches]

key-files:
  created:
    - convex/password/ResendOTPPasswordReset.ts
    - convex/password/PasswordResetEmail.tsx
    - src/features/auth/components/PasswordForm.tsx
    - src/features/auth/components/PasswordForm.test.tsx
  modified:
    - convex/auth.ts
    - src/routes/_app/login/_layout.index.tsx
    - src/features/auth/index.ts
    - vitest.config.ts
    - convex/tsconfig.json

key-decisions:
  - "Used named export { Password } from @convex-dev/auth/providers/Password (not default import)"
  - "Set reset provider id to 'password-reset' to avoid collision with existing 'resend-otp' provider"
  - "Used @oslojs/crypto/random instead of oslo/crypto (oslo not installed, oslojs is)"
  - "Login page restructured into 3 steps: main (password), otp, verify"

patterns-established:
  - "Password auth: signIn('password', { email, password, flow }) with flow: signIn|signUp"
  - "convex/password/ excluded from coverage like convex/otp/ (auth provider config)"

requirements-completed: [AUTH-01]

# Metrics
duration: 21min
completed: 2026-03-10
---

# Phase 02 Plan 01: Email/Password Auth Summary

**Password auth provider with PasswordForm component (signIn/signUp/forgot-password) and login page restructured to show password form primary with OTP and GitHub as alternatives**

## Performance

- **Duration:** 21 min
- **Started:** 2026-03-10T03:34:50Z
- **Completed:** 2026-03-10T03:55:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Password provider registered in Convex Auth alongside OTP and GitHub
- PasswordForm component with email/password fields, signIn/signUp toggle, forgot password callback
- Login page restructured: password form primary, OTP and GitHub as alternatives
- 10 comprehensive tests covering all PasswordForm interactions at 100% coverage

## Task Commits

Each task was committed atomically:

1. **Task 1: Password provider backend + reset provider stub** - `d42ead2` (feat)
2. **Task 2: PasswordForm component + login page integration** - `cbc13c7` (feat)
3. **Fix: Import beforeEach for typecheck compatibility** - `668ae62` (fix)

## Files Created/Modified
- `convex/auth.ts` - Added Password provider with reset capability
- `convex/password/ResendOTPPasswordReset.ts` - Email provider for password reset (id: "password-reset")
- `convex/password/PasswordResetEmail.tsx` - React Email template for reset code
- `src/features/auth/components/PasswordForm.tsx` - Email/password form with mode toggle
- `src/features/auth/components/PasswordForm.test.tsx` - 10 tests covering all interactions
- `src/features/auth/index.ts` - Updated barrel export
- `src/routes/_app/login/_layout.index.tsx` - Restructured login with password primary
- `vitest.config.ts` - Added convex/password/** to coverage exclusions
- `convex/tsconfig.json` - Updated lib ES2021 to ES2023 for Error cause support

## Decisions Made
- Used named import `{ Password }` (not default) -- the provider is a named export
- Set reset provider id to "password-reset" to avoid collision with existing "resend-otp" OTP provider
- Used `@oslojs/crypto/random` (already installed) instead of `oslo/crypto` (not installed)
- Applied project's established `v8 ignore` pattern for TanStack Form re-render timing branches
- Login page restructured into 3-step flow: main (password + alternatives), otp (email entry), verify (code entry)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Password provider import style**
- **Found during:** Task 1 (Password provider backend)
- **Issue:** Plan specified `import Password from "@convex-dev/auth/providers/Password"` (default import) but the provider exports as named: `export function Password`
- **Fix:** Changed to `import { Password } from "@convex-dev/auth/providers/Password"`
- **Files modified:** convex/auth.ts
- **Verification:** Tests pass, no TypeError at runtime
- **Committed in:** d42ead2

**2. [Rule 3 - Blocking] Fixed pre-existing convex/tsconfig.json lib target**
- **Found during:** Task 1 (pre-commit hook typecheck)
- **Issue:** convex/tsconfig.json had `"lib": ["ES2021", "dom"]` but convex/http.ts uses `new Error(msg, { cause })` which requires ES2022+. This was pre-existing and blocked all commits via the typecheck pre-commit hook.
- **Fix:** Updated lib to ES2023 (covers Error cause and other modern APIs)
- **Files modified:** convex/tsconfig.json
- **Verification:** `npx tsc -p convex/tsconfig.json --noEmit` passes
- **Committed in:** d42ead2

**3. [Rule 1 - Bug] Added missing beforeEach import in test file**
- **Found during:** Task 2 (typecheck verification)
- **Issue:** `beforeEach` used as global but tsconfig.app.json includes test files -- TypeScript couldn't find the type
- **Fix:** Added explicit `import { beforeEach } from "vitest"` matching project conventions
- **Files modified:** src/features/auth/components/PasswordForm.test.tsx
- **Verification:** `npx tsc -p tsconfig.app.json --noEmit` passes
- **Committed in:** 668ae62

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
- Working directory files were repeatedly deleted by an unknown process (possibly a file watcher or stale vitest cleanup). Resolved by staging files with git immediately after creation, and using `git checkout HEAD` to restore from commits.
- Task 1 commit became orphaned when another session's commits (02-02) were interleaved on main. Resolved by cherry-picking the orphaned commit onto HEAD.

## User Setup Required
None - no external service configuration required. Password auth uses the existing Resend API key already configured for OTP.

## Next Phase Readiness
- Password auth backend and frontend are wired
- Reset provider stub is ready for Plan 03 (password reset flow wiring)
- OTP and GitHub auth paths remain functional alongside password
- All tests pass at 100% coverage

---
*Phase: 02-auth-dx-infrastructure*
*Completed: 2026-03-10*
