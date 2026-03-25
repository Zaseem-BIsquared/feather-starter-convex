---
phase: 03-tasks
plan: 01
subsystem: task-backend
tags: [convex, tasks, mutations, queries, zod, backend]
dependency_graph:
  requires: []
  provides: [task-schema, task-mutations, task-queries, task-error-constants]
  affects: [convex/schema.ts, src/shared/errors.ts]
tech_stack:
  added: []
  patterns: [zCustomMutation-zod4, zodToConvex, convex-test]
key_files:
  created:
    - src/shared/schemas/tasks.ts
    - convex/tasks/mutations.ts
    - convex/tasks/mutations.test.ts
    - convex/tasks/queries.ts
    - convex/tasks/queries.test.ts
  modified:
    - convex/schema.ts
    - convex/_generated/api.d.ts
    - src/shared/errors.ts
decisions:
  - Used plain mutation (not zMutation) for update -- mixing v.id() with Zod .shape causes TS errors
  - Manually updated convex/_generated/api.d.ts since convex codegen requires running backend
metrics:
  duration: 10min
  completed: "2026-03-25T04:30:50Z"
  tasks: 3
  files: 8
  tests_added: 30
requirements: [TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06, TASK-07, TASK-08, TASK-09, TASK-10]
---

# Phase 03 Plan 01: Task Backend Summary

Complete task management backend with Zod schemas, Convex table, 6 mutations, 3 queries, and 30 tests at 100% coverage.

## What Was Built

### Zod Schemas (src/shared/schemas/tasks.ts)
- `taskStatus`: enum ("todo", "in_progress", "done")
- `taskVisibility`: enum ("private", "shared")
- `taskTitle`: string, 1-200 chars, trimmed
- `taskDescription`: optional string, max 5000 chars
- `createTaskInput`: object with title, description?, priority (default false)
- `updateTaskInput`: partial object with title?, description?, priority?

### Convex Table (convex/schema.ts)
- `tasks` table with all fields: title, description, priority, status, visibility, creatorId, assigneeId, projectId, position
- 4 indexes: by_assignee, by_visibility, by_creator, by_assignee_status

### Mutations (convex/tasks/mutations.ts)
1. `create` (zMutation): Creates task with defaults (status=todo, visibility=private, assigneeId=self, position=Date.now())
2. `update` (mutation): Partial update of title, description, priority
3. `remove` (mutation): Deletes a task
4. `updateStatus` (mutation): Sequential-only transitions (todo -> in_progress -> done)
5. `assign` (mutation): Sets assigneeId; auto-flips visibility to "shared" when assigning to non-creator
6. `reorder` (mutation): Updates position field

### Queries (convex/tasks/queries.ts)
1. `myTasks`: Tasks where assigneeId = current user, sorted by position
2. `teamPool`: Shared + unassigned tasks, sorted by position
3. `listUsers`: All users (for team member assignment)

### Error Constants (src/shared/errors.ts)
- `tasks.NOT_FOUND`: "Task not found."
- `tasks.INVALID_STATUS_TRANSITION`: "Invalid status transition."

## Test Coverage

- **22 mutation tests**: create (3), update (4), remove (2), updateStatus (6), assign (5), reorder (2)
- **8 query tests**: myTasks (3), teamPool (3), listUsers (2)
- **Total: 30 tests, 100% coverage** on all new files

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 722ed5c | Zod schemas, Convex table, error constants |
| 2+3 | 0b98dfc | Mutations, queries, and all 30 tests |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used plain mutation for update instead of zMutation**
- **Found during:** Task 2
- **Issue:** Mixing `v.id("tasks")` (Convex validator) with `updateTaskInput.shape` (Zod schemas) in zMutation args causes TS2739 type error
- **Fix:** Changed `update` to use plain `mutation` with Convex validators for all args
- **Files modified:** convex/tasks/mutations.ts

**2. [Rule 3 - Blocking] Manually updated convex/_generated/api.d.ts**
- **Found during:** Task 2
- **Issue:** Convex codegen requires a running local backend (`npx convex dev`); test files import from `api.tasks.mutations` which didn't exist
- **Fix:** Manually added tasks/mutations and tasks/queries imports to the generated API file
- **Files modified:** convex/_generated/api.d.ts

**3. [Rule 1 - Bug] Fixed unused variable TypeScript errors**
- **Found during:** Task 2+3 commit
- **Issue:** Pre-commit typecheck (`tsconfig.app.json`) flagged unused `userId` destructured variables in test files
- **Fix:** Removed unused `userId` from 3 test function signatures
- **Files modified:** convex/tasks/mutations.test.ts, convex/tasks/queries.test.ts

## Known Stubs

None -- all data paths are fully wired.

## Self-Check: PASSED

- All 8 files verified present
- Both commits (722ed5c, 0b98dfc) verified in git log
- 138 tests pass (23 test files), 100% coverage
