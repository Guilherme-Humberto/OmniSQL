# Quality Checklist: [Feature Name]

**Feature ID**: `[###-feature-name]`  
**Date**: `YYYY-MM-DD`  

---

## 1. Architectural Guardrails (Constitution Compliance)
- [ ] No monolithic component files (all styles extracted to dedicated `styles.ts`).
- [ ] No hardcoded strings, numbers, or ports (all in `app/constants/app-constants.ts`).
- [ ] SOLID principles adhered to (Single Responsibility, Strategy Pattern where applicable).
- [ ] Heavy database operations isolated in Worker Threads.

## 2. Privacy & Security
- [ ] Database credentials encrypted with `safeStorage`.
- [ ] Zero schema or database data leaks to outside APIs.

## 3. Automated Checks
- [ ] `npm run typecheck` passes with 0 diagnostics.
- [ ] `npm run lint:check` passes with 0 warnings/errors.
- [ ] `npm run test:sqlite` passes with 100% assertions.

