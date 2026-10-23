# Tarefas de Implementação: Cross-Database Queries via DuckDB

## Fase 1: Domínio e Contratos IPC
- [x] Criar contratos Conveyor em `conveyor/cross-db-contracts.ts` (inputs, outputs, catálogo de fontes).
- [x] Registrar módulo `conveyor/modules/cross-db.ts` no roteador do Conveyor.
- [x] Criar analisador de queries SQL em `app/features/cross-db/domain/query-analyzer.ts` para identificar tabelas e conexões referenciadas.

## Fase 2: Motor DuckDB no Main Process
- [x] Implementar `lib/main/cross-db/duckdb-engine.ts` gerenciando a instância in-memory do DuckDB.
- [x] Implementar mecanismo de ingestão/sincronização de tabelas entre conexões ativas (`SQLiteAdapter`, `PostgresAdapter`, `MySQLAdapter`) e o DuckDB.
- [x] Implementar suporte direto a arquivos `.csv`, `.parquet`, `.json` e `.sqlite` via funções analíticas do DuckDB.
- [x] Adicionar diálogo nativo para seleção de arquivos locais no Main process.

## Fase 3: Apresentação e Interface do Usuário
- [x] Criar constantes de modo Cross-DB em `app/constants/app-constants.ts`.
- [x] Criar componente `CrossDbSourcesDrawer` (`index.tsx` e `styles.ts`) listando as fontes federadas disponíveis e snippets de cópia.
- [x] Adicionar botão para anexar arquivos locais CSV/Parquet e inserir snippet SQL no CodeMirror.
- [x] Integrar execução de queries Cross-DB no `workspace` conectando aos resultados em `QueryResults`.

## Fase 4: Testes Automatizados e Quality Gates
- [x] Criar suite de testes `tests/cross-db-duckdb.test.ts` cobrindo:
  - Execução in-memory do DuckDB.
  - JOIN entre tabelas sincronizadas de fontes distintas.
  - Leitura e filtragem de arquivos CSV locais.
- [x] Validar Quality Gates obrigatórios: `npm run typecheck && npm run lint:check && npm run test:sqlite`.

