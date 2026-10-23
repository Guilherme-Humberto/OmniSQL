# Specifications Directory (`specs/`)

This directory contains the feature specifications, technical plans, and task breakdowns for the **SQL Editor**, structured according to the official **[GitHub Spec Kit](https://github.com/github/spec-kit)** specification-driven development standard.

---

## 📂 Active Feature Specifications

| ID | Feature | Spec | Plan | Tasks | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `001` | **Connection Hub & Secure Credentials** | [`spec.md`](./001-connection-management/spec.md) | [`plan.md`](./001-connection-management/plan.md) | [`tasks.md`](./001-connection-management/tasks.md) | `Completed` |
| `002` | **Mini-Dashboard Data Visualization** | [`spec.md`](./002-chart-visualization/spec.md) | [`plan.md`](./002-chart-visualization/plan.md) | [`tasks.md`](./002-chart-visualization/tasks.md) | `Completed` |
| `003` | **One-Click ORM & API Code Generator** | [`spec.md`](./003-orm-code-generation/spec.md) | [`plan.md`](./003-orm-code-generation/plan.md) | [`tasks.md`](./003-orm-code-generation/tasks.md) | `Completed` |
| `004` | **Local AI Assistant (Ollama Offline)** | [`spec.md`](./004-local-ai-text-to-sql/spec.md) | [`plan.md`](./004-local-ai-text-to-sql/plan.md) | [`tasks.md`](./004-local-ai-text-to-sql/tasks.md) | `Completed` |
| `005` | **IDE-Style FK Navigation (Peek Overlay)** | [`spec.md`](./005-foreign-key-peek/spec.md) | [`plan.md`](./005-foreign-key-peek/plan.md) | [`tasks.md`](./005-foreign-key-peek/tasks.md) | `Completed` |
| `006` | **Direct Native Connections (PostgreSQL & MySQL)** | [`spec.md`](./006-native-postgres-mysql/spec.md) | [`plan.md`](./006-native-postgres-mysql/plan.md) | [`tasks.md`](./006-native-postgres-mysql/tasks.md) | `Completed` |
| `007` | **Data Masking & Export (LGPD / GDPR Compliant)** | [`spec.md`](./007-data-masking-export/spec.md) | [`plan.md`](./007-data-masking-export/plan.md) | [`tasks.md`](./007-data-masking-export/tasks.md) | `Completed` |
| `008` | **Database Documentation Suite (Dictionary, Mermaid ER & AI)** | [`spec.md`](./008-database-documentation-suite/spec.md) | [`plan.md`](./008-database-documentation-suite/plan.md) | [`tasks.md`](./008-database-documentation-suite/tasks.md) | `Completed` |
| `009` | **Cross-Database Queries via DuckDB** | [`spec.md`](./009-cross-database-duckdb/spec.md) | [`plan.md`](./009-cross-database-duckdb/plan.md) | [`tasks.md`](./009-cross-database-duckdb/tasks.md) | `Completed` |

---

## 🛠️ Spec Kit Lifecycle Workflow

To propose and implement new features, follow the canonical GitHub Spec Kit workflow:

1. **Constitution Guardrails**: Consult [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) for architectural constraints (Clean Architecture, SOLID, isolated styles, no magic values).
2. **Specify**: Copy [`.specify/templates/spec-template.md`](../.specify/templates/spec-template.md) to `specs/[###-feature-name]/spec.md` to define user stories and acceptance criteria.
3. **Plan**: Copy [`.specify/templates/plan-template.md`](../.specify/templates/plan-template.md) to `specs/[###-feature-name]/plan.md` to detail technical architecture, IPC contracts, and sequence diagrams.
4. **Tasks**: Copy [`.specify/templates/tasks-template.md`](../.specify/templates/tasks-template.md) to `specs/[###-feature-name]/tasks.md` to create actionable engineering task lists.
5. **Implement & Verify**: Build the code against the tasks and validate through:
   - `npm run typecheck`
   - `npm run lint:check`
   - `npm run test:sqlite`
