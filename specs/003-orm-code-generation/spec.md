# Feature Specification: One-Click ORM & API Code Generator

**Feature ID**: `003-orm-code-generation`  
**Status**: `Implemented`  
**Created**: `2026-10-23`  
**Updated**: `2026-10-23`  

---

## 1. Executive Summary & Value Proposition
A smart export utility that translates validated SQL queries and their returned datasets into production-ready application code across leading backend ecosystems: Prisma (Node.js/TypeScript), TypeORM (TypeScript), Entity Framework Core (C#), SQLAlchemy (Python), and Express.js REST API route handlers.

---

## 2. Problem Statement & Motivation
- **Pain Point**: Developers spend considerable time translating complex SQL queries into application code, manually creating DTO types, mapping columns, and wiring router endpoints.
- **Current Workaround**: Manual copy-pasting and tedious typing susceptible to runtime errors and typos.
- **Competitive Differentiation**: Instant 1-click code generation with accurate cross-language type inference (TypeScript, C#, Python).

---

## 3. User Stories & Scenarios

### User Story 1 - Export to Prisma / Node.js (P1)
> As a Node.js developer,  
> I want to click "Gerar Código" and select "Prisma",  
> So that I get a typed interface and `prisma.$queryRaw` snippet ready to paste into my service.

### User Story 2 - Export to C# / Entity Framework Core (P1)
> As a .NET backend engineer,  
> I want to generate a C# DTO with PascalCase properties and an `SqlQueryRaw` snippet.

---

## 4. Functional Requirements
- [x] Dedicated "Gerar Código" button on query results toolbar.
- [x] Cross-language type inference from returned dataset rows.
- [x] Multi-target strategies: Prisma, TypeORM, EF Core, SQLAlchemy, Express REST.
- [x] 1-click copy to clipboard with visual confirmation.

