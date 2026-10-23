# Implementation Tasks: IDE-Style Data Navigation (Foreign Key Peek Overlay)

**Feature ID**: `005-foreign-key-peek`  
**Status**: `Completed`  
**Plan Reference**: `plan.md`  

---

## Task Group 1: Metadata & Worker Point Lookup
- [x] Task 1.1: Extend schema reader to fetch foreign keys (`PRAGMA foreign_key_list(table)`).
- [x] Task 1.2: Implement `peekRecord` in `database-worker.ts` and conveyor IPC bridge.
- [x] Task 1.3: Add unit tests verifying FK parsing in `tests/sqlite-adapter.test.ts`.

---

## Task Group 2: Frontend Modifier Key & Hover Interaction
- [x] Task 2.1: Implement `useModifierKey` hook listening to `Control` / `Meta` keydown/keyup.
- [x] Task 2.2: Add visual affordance styling in `query-results/styles.ts` for clickable FK cells.

---

## Task Group 3: Overlay Presentation
- [x] Task 3.1: Create `fk-peek-overlay/styles.ts` with backdrop, key-value rows, and animations.
- [x] Task 3.2: Create `fk-peek-overlay/index.tsx` with copy-to-clipboard, loading skeleton, and error boundary.
- [x] Task 3.3: Wire overlay mounting into `query-results/index.tsx`.

---

## Task Group 4: Verification & Quality Gates
- [x] Task 4.1: `npm run typecheck` passes with 0 diagnostics.
- [x] Task 4.2: `npm run lint:check` passes with 0 errors.
- [x] Task 4.3: `npm run test:sqlite` passes (13/13 tests passing).
