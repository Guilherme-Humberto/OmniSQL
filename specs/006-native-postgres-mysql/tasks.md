# Implementation Tasks: Conectores Nativos Diretos para PostgreSQL e MySQL

**Feature ID**: `006-native-postgres-mysql`  
**Status**: `Completed`  

---

## Task Group 1: Contratos e Interfaces de Adaptador
- [x] Task 1.1: Atualizar `conveyor/database-contracts.ts` para suportar drivers `'sqlite' | 'postgres' | 'mysql'` em `DatabaseConnection`.
- [x] Task 1.2: Criar `lib/main/database-adapter.ts` com a interface unificada assíncrona `DatabaseAdapter`.

---

## Task Group 2: Implementação dos Adaptadores Nativos
- [x] Task 2.1: Implementar `lib/main/postgres-adapter.ts` usando `pg.Pool` com serialização de tipos, catálogo de tabelas/colunas/chaves e `peekRecord`.
- [x] Task 2.2: Implementar `lib/main/mysql-adapter.ts` usando `mysql2/promise` com catálogo, execução e `peekRecord`.
- [x] Task 2.3: Atualizar `DatabaseService` para abrir e gerenciar conexões SQLite, PostgreSQL e MySQL.
- [x] Task 2.4: Implementar teste de conexão em `conveyor/modules/connections.ts`.

---

## Task Group 3: Integração no Hub de Conexões e Workspace
- [x] Task 3.1: Permitir que o botão "Conectar" no Hub de Conexões abra conexões PostgreSQL e MySQL diretamente no Workspace.
- [x] Task 3.2: Permitir "Testar Conexão" no formulário de conexões com feedback visual.
- [x] Task 3.3: Exibir o driver correto (`POSTGRESQL · SQL`, `MYSQL · SQL`, `SQLITE · SQL`) no status e barra de ferramentas do editor.

---

## Task Group 4: Testes & Portões de Qualidade
- [x] Task 4.1: Criar testes unitários para mapeamento de catálogo e serialização de dados de Postgres/MySQL em `tests/`.
- [x] Task 4.2: Validar `npm run typecheck` (zero erros).
- [x] Task 4.3: Validar `npm run lint:check` (zero erros).
- [x] Task 4.4: Validar `npm run test:sqlite` (100% de sucesso).
