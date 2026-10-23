# Especificação Técnica: Cross-Database Queries via DuckDB

## 1. Visão Geral e Contexto de Negócio

No ecossistema moderno de desenvolvimento e engenharia de dados, é extremamente comum que um desenvolvedor ou analista precise correlacionar dados distribuídos entre múltiplos bancos de dados heterogêneos (por exemplo, pedidos no MySQL de produção, clientes no PostgreSQL de CRM e métricas em arquivos CSV/Parquet locais).

Atualmente, para realizar um simples `JOIN` entre essas fontes, o usuário é obrigado a escrever scripts avulsos em Python (com Pandas/Polars) ou Node.js, ou exportar e importar dumps manualmente.

Esta feature integra o **DuckDB** sob o capô do SQL Editor, permitindo executar **consultas SQL federadas (Cross-Database Queries)** diretamente na interface, cruzando dados de PostgreSQL, MySQL, SQLite e arquivos locais (CSV, Parquet, JSON) em milissegundos com zero fricção.

---

## 2. User Stories

### US-1: Consulta Federada Cross-Database
> **Como** desenvolvedor ou analista de dados,  
> **Quero** escrever uma query SQL única com `JOIN` entre uma tabela do MySQL e uma tabela do PostgreSQL,  
> **Para que** eu possa correlacionar dados de diferentes sistemas sem precisar de pipelines complexos de ETL.

### US-2: Cruzamento com Arquivos Locais (CSV / Parquet / JSON)
> **Como** desenvolvedor,  
> **Quero** cruzar uma tabela de banco remoto com um arquivo `.csv` ou `.parquet` que recebi do cliente,  
> **Para que** eu possa auditar ou reconciliar relatórios instantaneamente.

### US-3: Não Travamento da Interface (60fps)
> **Como** usuário do editor desktop,  
> **Quero** que as consultas analíticas pesadas no DuckDB rodem em background (Worker Thread),  
> **Para que** a interface permaneça rápida e fluida sem congelar a aplicação.

---

## 3. Critérios de Aceite

1. **Catálogo Federado Unificado**:
   - Cada conexão salva no gerenciador de conexões pode ser referenciada pelo seu nome normalizado ou identificador (ex: `mysql_prod.pedidos`, `pg_crm.clientes`).
   - Suporte a arquivos locais via funções nativas do DuckDB: `read_csv_auto('caminho.csv')`, `read_parquet('caminho.parquet')`, `read_json_auto('caminho.json')`.
2. **Motor DuckDB Isolado no Main/Worker Process**:
   - O DuckDB roda em processo Main / Worker Thread, sem qualquer dependência nativa no processo de renderização React (isolamento estrito IPC).
   - Comunicação 100% tipada via Electron Conveyor (`conveyor/cross-db-contracts.ts`).
3. **Seletor de Modo na Interface**:
   - O usuário pode selecionar o modo "Cross-Database (DuckDB)" na aba de consulta ou na barra superior de ferramentas.
   - O painel exibe um assistente lateral ou modal com as fontes disponíveis (conexões ativas e botão para anexar arquivos CSV/Parquet).
4. **Compatibilidade com o Ecossistema do Editor**:
   - Os resultados da query DuckDB retornam como `DatabaseQueryResult`, integrando-se perfeitamente com a grade de resultados, gráficos analíticos (`QueryChart`), Dicionário e mascaramento LGPD.
5. **Quality Gates**:
   - `npm run typecheck`, `npm run lint:check` e `npm run test:sqlite` com 100% de sucesso.

