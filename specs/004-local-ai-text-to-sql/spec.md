# Feature Specification: Local AI Assistant (Complex Queries & Database Modeling with Ollama)

**Feature ID**: `004-local-ai-text-to-sql`  
**Status**: `In Progress`  
**Created**: `2026-10-23`  
**Updated**: `2026-10-23`  

---

## 1. Executive Summary & Value Proposition
Integrate a privacy-first, local AI assistant powered by **Ollama** (`http://127.0.0.1:11434`) running entirely on the developer's computer. The assistant specializes strictly in two high-value developer capabilities:
1. **Complex Query Generation**: Translating natural language requests into sophisticated SQL queries (multi-table joins, subqueries, CTEs, window functions, and analytics).
2. **Database Modeling & DDL**: Designing normalized table structures, relationships, constraints, indexes, and migrations based on functional requirements.

> 🛡️ **Mandatory Safety Constraint (Human-in-the-Loop)**: The AI assistant has **ZERO direct execution control** over the database. It cannot execute queries, modify data, or alter tables directly. It acts strictly as an advisory code generator, presenting SQL drafts for the human developer to review, inspect, edit, and manually execute.

---

## 2. Problem Statement & Motivation
- **Security & Privacy Barriers**: Corporate compliance rules strictly prohibit sending enterprise schemas, table structures, and queries to external third-party cloud APIs (OpenAI, Anthropic, Google Cloud).
- **Complexity in SQL & Modeling**: Writing complex analytical queries (e.g. recursive CTEs, cohort retention, window functions) or designing normalized DDL schemas with foreign keys and indexes requires significant time.
- **Risk of Autonomous AI Execution**: Giving an AI autonomous or automated write/execute access to a database poses unacceptable risks of data corruption, accidental `DROP TABLE`, or destructive data loss. An advisory-only model preserves complete human oversight.

---

## 3. User Stories & Scenarios

### User Story 1 - Complex Analytical Query Creation (P1)
> As a developer,  
> I want to describe a complex data requirement in natural language,  
> So that the local AI drafts a syntactically correct query respecting my active database dialect without executing anything automatically.

#### Acceptance Scenario 1.1: Human Review Gate
- **Given** an active database schema with tables `orders`, `customers`, and `order_items`
- **When** the user asks: "Find the top 3 customers with highest total purchase value this quarter"
- **Then** the AI generates the SQL snippet with an explanation.
- **And** the query is **not executed**; instead, buttons are provided: "Inserir no Editor", "Copiar SQL" or "Abrir em Nova Aba".

### User Story 2 - Database Modeling & DDL Creation (P1)
> As a software architect,  
> I want to describe a new domain feature (e.g. "E-commerce voucher and discount system"),  
> So that the local AI suggests normalized DDL statements (`CREATE TABLE`, primary keys, foreign keys, and indexes) adhering to the active dialect.

### User Story 3 - Graceful Handling when Ollama is Offline (P2)
> As a developer without Ollama running,  
> I want to see a clear status badge and simple setup instructions,  
> So that I can start Ollama locally (`ollama run qwen2.5-coder`) and retry with a single click.

---

## 4. Functional Requirements

### 4.1 Local Ollama Discovery & Connectivity
- [ ] Ping `http://127.0.0.1:11434/api/tags` to list installed local models (e.g. `qwen2.5-coder`, `deepseek-coder`, `sqlcoder`, `llama3`).
- [ ] Real-time status indicator (Connected with model list vs. Offline with setup command guide).
- [ ] Model selector dropdown with local persistence of developer preference.

### 4.2 Assistant Modes
- [ ] **Modo Consulta (Query Assistant)**: Optimized for `SELECT` queries, CTEs, joins, and aggregations.
- [ ] **Modo Modelagem (DDL Modeling)**: Optimized for `CREATE TABLE`, `ALTER TABLE`, foreign keys, indexes, and schema design.

### 4.3 Privacy & Human-in-the-Loop Guardrails
- [ ] Only metadata (table names, column names, column types) is passed into the prompt; **zero customer or row data** is ever sent.
- [ ] All generated SQL is presented in a preview card with syntax highlighting and explanation.
- [ ] Zero automatic query execution. Manual review is strictly enforced.
