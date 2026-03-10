---
phase: 3
slug: tasks
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0 + convex-test 0.0.41 (backend) / Testing Library (frontend) |
| **Config file** | package.json (`npm test` -> `vitest run`) |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | TASK-01 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "create" -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | TASK-02 | unit | `npx vitest run convex/tasks/queries.test.ts -t "myTasks" -x` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | TASK-03 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "update" -x` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | TASK-04 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "delete" -x` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | TASK-05 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "updateStatus" -x` | ❌ W0 | ⬜ pending |
| 03-01-06 | 01 | 1 | TASK-06 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "private" -x` | ❌ W0 | ⬜ pending |
| 03-01-07 | 01 | 1 | TASK-07 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "assign" -x` | ❌ W0 | ⬜ pending |
| 03-01-08 | 01 | 1 | TASK-08 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "assign" -x` | ❌ W0 | ⬜ pending |
| 03-01-09 | 01 | 1 | TASK-09 | unit | `npx vitest run convex/tasks/queries.test.ts -t "teamPool" -x` | ❌ W0 | ⬜ pending |
| 03-01-10 | 01 | 1 | TASK-10 | unit | `npx vitest run convex/tasks/mutations.test.ts -t "reorder" -x` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | VIEW-01 | unit | `npx vitest run src/features/tasks/tasks.test.tsx -t "My Tasks" -x` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | VIEW-02 | unit | `npx vitest run src/features/tasks/tasks.test.tsx -t "Team Pool" -x` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | VIEW-06 | unit | `npx vitest run src/features/tasks/tasks.test.tsx -t "nav" -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/shared/schemas/tasks.ts` — Zod schemas for task domain
- [ ] `convex/tasks/queries.test.ts` — stubs for TASK-02, TASK-09
- [ ] `convex/tasks/mutations.test.ts` — stubs for TASK-01, TASK-03 through TASK-08, TASK-10
- [ ] `src/features/tasks/tasks.test.tsx` — stubs for VIEW-01, VIEW-02, VIEW-06
- [ ] `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` — for TASK-10

*Existing infrastructure covers test framework (Vitest + convex-test + Testing Library already installed).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-reorder visual feedback | TASK-10 | Visual animation/UX | Drag a task up/down, verify smooth animation and correct final position |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
