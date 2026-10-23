# Technical Architecture Plan: Conectores Nativos Diretos para PostgreSQL e MySQL

**Feature ID**: `006-native-postgres-mysql`  
**Status**: `In Progress`  
**Spec Reference**: `spec.md`  

---

## 1. Architectural Strategy & SOLID Alignment

- **Open/Closed Principle (OCP)** & **Strategy Pattern**:
  A interface `DatabaseAdapter` em [`lib/main/database-adapter.ts`](file:///home/guilherme/Documentos/projetos/sql-editor/lib/main/database-adapter.ts) define o contrato abstrato comum:
  ```typescript
  export interface DatabaseAdapter {
    listTables(): Promise<DatabaseTable[]>
    getSchema(): Promise<DatabaseSchema>
    listColumns(tableName: string): Promise<DatabaseColumn[]>
    listForeignKeys(tableName: string): Promise<DatabaseForeignKey[]>
    getAllForeignKeys(): Promise<Record<string, DatabaseForeignKey[]>>
    peekRecord(targetTable: string, targetColumn: string, value: string | number): Promise<DatabasePeekResult>
    execute(sql: string): Promise<DatabaseQueryResult>
    close(): Promise<void>
  }
  ```
  Isso permite que `SQLiteAdapter`, `PostgresAdapter` e `MySQLAdapter` sejam intercambiáveis sem que o resto do sistema precise saber qual banco está sendo acessado.

- **Single Responsibility (SRP)**:
  - `PostgresAdapter`: Mapeia tipos PG (`node-postgres`), `pg_catalog` e executa queries parametrizadas.
  - `MySQLAdapter`: Mapeia tipos MySQL (`mysql2/promise`), `information_schema` e gerencia pool de conexões.
  - `DatabaseService`: Fábrica e gerenciador unificado de conexões ativas por `connectionId`.

---

## 2. Component & Directory Layout

```text
lib/main/
├── database-adapter.ts             # Interface unificada
├── sqlite-adapter.ts               # Implementação SQLite existente
├── postgres-adapter.ts             # Novo conector PostgreSQL
├── mysql-adapter.ts                # Novo conector MySQL
└── database-service.ts             # Orquestrador multi-banco

conveyor/
├── database-contracts.ts          # Extensão para suportar 'postgres' e 'mysql'
└── modules/
    ├── database.ts
    └── connections.ts             # Teste de conexão e conexão direta a perfis
```

---

## 3. Catálogo de Esquemas por Driver

1. **PostgreSQL**:
   - Tabelas: `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
   - Colunas: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;`
   - Chaves Primárias: `pg_index` e `pg_attribute`.
   - Chaves Estrangeiras: `information_schema.table_constraints` + `key_column_usage` + `constraint_column_usage`.

2. **MySQL**:
   - Tabelas: `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name;`
   - Colunas: `SELECT column_name, data_type, is_nullable, column_key FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?;`
   - Chaves Estrangeiras: `information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = DATABASE()`.

