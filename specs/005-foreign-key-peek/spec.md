# Feature Specification: IDE-Style Data Navigation (Foreign Key Peek Overlay)

**Feature ID**: `005-foreign-key-peek`  
**Status**: `Ready for Implementation`  
**Created**: `2026-10-23`  
**Updated**: `2026-10-23`  

---

## 1. Executive Summary & Value Proposition
An IDE-style ("Go to Definition / Peek") relational data inspection experience. In the query results grid, when a cell represents a foreign key (e.g. `user_id = 45`), the developer can hold `Ctrl` (or `Cmd`) and click the value to open a sleek floating card (peek overlay) showing the parent record's complete attributes without leaving the current screen and without writing a `JOIN`.

---

## 2. Problem Statement & Motivation
- **Pain Point**: Inspecting referenced rows in relational databases requires opening another tab, recalling table names, and writing manual `WHERE id = ?` queries.
- **Current Workaround**: Opening multiple tabs in Beekeeper or Workbench, cluttering the workspace and losing mental focus.
- **Competitive Differentiation**: Brings VS Code's beloved "Peek" code navigation directly into the tabular data viewing experience.

---

## 3. User Stories & Scenarios

### User Story 1 - Instant Peek of Foreign Key Record (P1)
> As a developer viewing an `orders` table,  
> I want to Ctrl+Click on `customer_id = 12`,  
> So that a floating card displays the customer's name, email, and created date immediately.

#### Acceptance Scenario 1.1: Fast Keyboard + Click Interaction
- **Given** the result table displays a column with an active foreign key constraint
- **When** the user holds `Ctrl` or `Cmd` and clicks the cell value
- **Then** a floating card appears anchored to the cell displaying the referenced record.

---

## 4. Functional Requirements
- [ ] Catalog inspection extracting FK relationships (`PRAGMA foreign_key_list` for SQLite, `information_schema` for Postgres/MySQL).
- [ ] Visual indicator (subtle underline) on FK cells when `Ctrl`/`Cmd` is pressed.
- [ ] Fast indexed fetch: `SELECT * FROM [parent_table] WHERE [pk] = ? LIMIT 1`.
- [ ] Interactive floating card with key-value grid, "Copy as JSON", and close on click-outside or `Escape`.

