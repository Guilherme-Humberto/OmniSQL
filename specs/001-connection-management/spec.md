# Feature Specification: Connection Hub & Secure Credentials

**Feature ID**: `001-connection-management`  
**Status**: `Implemented`  
**Created**: `2026-10-23`  
**Updated**: `2026-10-23`  

---

## 1. Executive Summary & Value Proposition
A modern, intuitive connection manager screen inspired by Beekeeper Studio with a sleek dark aesthetic. Enables developers to organize, label, test, and save database connections across SQLite, PostgreSQL, and MySQL, with safe OS-level password encryption and quick connection string import from cloud providers (Supabase, Neon, Render, Railway, AWS).

---

## 2. Problem Statement & Motivation
- **Pain Point**: Traditional database tools (like MySQL Workbench) feature cluttered, unintuitive connection screens with poor multi-database support.
- **Current Workaround**: Developers manually craft long command-line strings or leave plaintext credentials exposed in config files.
- **Competitive Differentiation**: Brings Beekeeper Studio's clean dual-pane layout, colored tag markers, and connection URL import directly into a lightning-fast Electron desktop client.

---

## 3. User Stories & Scenarios

### User Story 1 - SQLite Database Connection (P1)
> As a developer,  
> I want to pick or create an SQLite database file using my OS native dialog,  
> So that I can immediately query local datasets without server setup.

#### Acceptance Scenario 1.1: Local File Selection
- **Given** the user is on the Connection Hub screen
- **When** the user selects "SQLite" and clicks "Abrir Arquivo"
- **Then** the native OS file picker opens, allowing selection of `.sqlite` or `.db` files, auto-populating the file path.

### User Story 2 - URL String Import (P1)
> As a backend developer,  
> I want to paste a connection URI (e.g. `postgres://user:pass@host:5432/dbname`),  
> So that all connection fields are parsed and filled automatically without manual typing.

---

## 4. Functional Requirements
- [x] Multi-driver support for SQLite, PostgreSQL, and MySQL.
- [x] Color-coded connection tags (8 colors) for visual organization.
- [x] Safe password storage using native OS credentials vault (`safeStorage`).
- [x] URL import modal parsing standard URIs (`postgres://`, `mysql://`, `sqlite://`).
- [x] Recent connections list displaying human-readable timestamps ("5 minutes ago").

