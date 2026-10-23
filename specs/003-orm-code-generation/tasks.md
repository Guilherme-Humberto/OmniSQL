# Implementation Tasks: One-Click ORM & API Code Generator

**Feature ID**: `003-orm-code-generation`  
**Status**: `Completed`  
**Plan Reference**: `plan.md`  

---

## Task Group 1: Domain & Strategy Pattern Setup
- [x] Task 1.1: Define `CodeGeneratorStrategy` and `GenerationContext` contracts.
- [x] Task 1.2: Implement `inferColumnType()` with cross-language type mappings.
- [x] Task 1.3: Implement `PrismaStrategy` (Node.js/TypeScript).
- [x] Task 1.4: Implement `TypeORMStrategy` (TypeScript).
- [x] Task 1.5: Implement `EFCoreStrategy` (C# / .NET).
- [x] Task 1.6: Implement `SQLAlchemyStrategy` (Python).
- [x] Task 1.7: Implement `ExpressRestStrategy` (Express.js router handler).

---

## Task Group 2: Modal UI & Clipboard
- [x] Task 2.1: Implement `code-generator-modal/styles.ts` with tab selectors and syntax block.
- [x] Task 2.2: Implement `code-generator-modal/index.tsx` with clipboard copy feedback.
- [x] Task 2.3: Wire trigger button into `query-results/index.tsx`.

---

## Task Group 3: Verification & Quality Gates
- [x] Task 3.1: Verify generated code validity for each language.
- [x] Task 3.2: `npm run typecheck` passes with 0 diagnostics.
- [x] Task 3.3: `npm run lint:check` passes with 0 errors.

