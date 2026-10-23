# Project Constitution: SQL Editor

This constitution defines the non-negotiable architectural principles, engineering guardrails, and coding standards for the **SQL Editor** project. All specifications (`specs/**/spec.md`), technical plans (`specs/**/plan.md`), task breakdowns (`specs/**/tasks.md`), and AI agent implementations must strictly adhere to these rules.

---

## 1. Core Architectural Principles (Clean Architecture & SOLID)

### 1.1 Strict Layering & Separation of Concerns
1. **Presentation Layer (`app/components/`, `app/features/`, `app/shell/`)**:
   - Pure React components focused on user interaction, reactive state subscription, and DOM rendering.
   - Zero direct Node.js runtime or filesystem calls. All backend operations must go through the typed Conveyor IPC bridge.
2. **Domain Layer (`domain/`, `features/*/domain/`)**:
   - Pure TypeScript containing business models, data aggregation algorithms, type inference, formatting, and mathematical operations.
   - Must remain 100% agnostic to UI frameworks, Electron, or DOM APIs.
3. **Application & Infrastructure Layer (`lib/main/`, `conveyor/`, `lib/worker/`)**:
   - Main process orchestration, OS window management, native file pickers, secure credential storage.
   - Dedicated Worker Threads (`database-worker.ts`) for CPU- or I/O-intensive database tasks to ensure 60fps UI responsiveness without event loop blocking.

### 1.2 SOLID Guardrails
- **Single Responsibility (SRP)**: Every component, class, and module must have exactly one reason to change. Separate styling from logic, and separate data fetching from data presentation.
- **Open/Closed (OCP)**: Favor pluggable strategy patterns (e.g. `CodeGeneratorStrategy`, multi-database drivers) so new engines or targets can be registered without modifying existing strategies.
- **Liskov Substitution (LSP)**: Database driver implementations and generator strategies must honor their base interfaces without unexpected side-effects.
- **Interface Segregation (ISP)**: Avoid monolithic interface contracts. Prefer fine-grained types (`ConnectionDraft`, `ConnectionRecord`, `QueryRequest`, `QueryResult`).
- **Dependency Inversion (DIP)**: High-level modules depend on typed IPC contracts (`conveyor/*-contracts.ts`), not concrete native implementations.

---

## 2. Component Structure & Styling Rules

### 2.1 Component Directory Standard
- **No Monolithic Files**: Components must never mix styled-components CSS-in-JS code inside the JSX/TSX logic file.
- **Folder Convention**: Every component must live in its own directory containing:
  ```text
  [ComponentName]/
  ├── index.tsx   # Component logic, state, hooks, and JSX render tree
  └── styles.ts   # All styled-components, CSS variables, and keyframe animations
  ```
- **Consistent Export**: Components must export a named function matching the directory name.

### 2.2 Styling Best Practices
- Rely strictly on CSS custom properties (`var(--surface)`, `var(--brand)`, `var(--foreground)`, `var(--border)`) to ensure native Dark and Light theme adaptability.
- No hardcoded hex values or pixel heights inside JSX inline `style={{ ... }}` unless calculating dynamic geometry (e.g., SVG paths or canvas coordinates).

---

## 3. Zero Magic Values (Centralized Constants & Enums)

- **Mandatory Centralization**: Hardcoded strings, magic port numbers, default limits, timeouts, and action types are forbidden in business and view logic.
- **Single Source of Truth**: All global constants and enums must be declared in [`app/constants/app-constants.ts`](file:///home/guilherme/Documentos/projetos/sql-editor/app/constants/app-constants.ts) or domain-specific constant files:
  - `DatabaseDriver` (`sqlite`, `postgres`, `mysql`)
  - `AppView` (`connections`, `workspace`)
  - `ChartType` (`bar`, `line`, `pie`)
  - `DEFAULT_DATABASE_PORTS` (`5432`, `3306`)
  - `APP_LIMITS` (default query limit, pagination thresholds)
  - `UI_TIMEOUTS` (debounce, tooltip delays, feedback timers)

---

## 4. Security, Privacy & Local-First Guardrails

1. **Local & Offline Privacy**:
   - Schemas and database content must never leave the user's machine without explicit user opt-in.
   - AI features (Text-to-SQL) must run locally via Ollama (`127.0.0.1`) to ensure absolute data privacy and LGPD/GDPR compliance.
2. **Encrypted Credential Storage**:
   - Passwords and sensitive connection tokens must be encrypted using Electron's native OS `safeStorage` (Keychain / DPAPI / Secret Service).
   - Plaintext passwords must never be stored in configuration files or unmasked log outputs.

---

## 5. Quality Gates & Verification Checklist

Before any feature, refactor, or bugfix is considered ready, it must pass all three quality gates:
1. **Type Safety**: `npm run typecheck` passes with zero TypeScript diagnostics.
2. **Linting**: `npm run lint:check` passes without ESLint errors or style warnings.
3. **Automated Testing**: `npm run test:sqlite` executes successfully with 100% passing tests for worker thread execution, blob serialization, schema inspection, and large result handling.

