# Implementation Tasks: Local AI Assistant (Ollama)

**Feature ID**: `004-local-ai-text-to-sql`  
**Status**: `Completed`  
**Plan Reference**: `plan.md`  

---

## Task Group 1: Domain & Contracts Setup
- [x] Task 1.1: Define `conveyor/ai-contracts.ts` with Zod schemas (`aiStatusSchema`, `aiGenerateInputSchema`, `aiGenerateOutputSchema`).
- [x] Task 1.2: Implement `prompt-builder.ts` for schema metadata summarization (dialect-aware, zero row data).
- [x] Task 1.3: Implement `response-parser.ts` to parse SQL codeblocks and explanations cleanly.
- [x] Task 1.4: Add unit tests in `tests/ai-prompt.test.ts` validating prompt generation and output parsing.

---

## Task Group 2: Main Process & Conveyor Module
- [x] Task 2.1: Implement `lib/main/ai/ollama-service.ts` using Node.js native `fetch` with timeouts and error handling.
- [x] Task 2.2: Implement `conveyor/modules/ai.ts` and register in `conveyor/router.ts`.

---

## Task Group 3: Frontend Presentation & Interaction
- [x] Task 3.1: Create `app/features/ai-assistant/constants.ts` with default models, modes, and help texts.
- [x] Task 3.2: Create `ai-status-badge/` (`index.tsx` + `styles.ts`) showing Online/Offline indicator and setup tips.
- [x] Task 3.3: Create `ai-trigger-button/` (`index.tsx` + `styles.ts`) for the Editor toolbar.
- [x] Task 3.4: Create `ai-modal/` (`index.tsx` + `styles.ts`) with dual modes ("Consulta Analítica" e "Modelagem DDL"), SQL preview, and "Inserir no Editor".
- [x] Task 3.5: Integrate into `app/components/sql-editor/` and `app/components/workspace/index.tsx`.

---

## Task Group 4: Verification & Quality Gates
- [x] Task 4.1: `npm run typecheck` passes with 0 diagnostics.
- [x] Task 4.2: `npm run lint:check` passes with 0 errors.
- [x] Task 4.3: `npm run test:sqlite` and new tests pass 100% (9/9 tests pass).
- [x] Task 4.4: Verify offline fallback and human review guardrail.
