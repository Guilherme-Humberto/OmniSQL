# Feature Specification: Conectores Nativos Diretos para PostgreSQL e MySQL

**Feature ID**: `006-native-postgres-mysql`  
**Status**: `In Progress`  
**Created**: `2026-10-23`  
**Updated**: `2026-10-23`  

---

## 1. Executive Summary & Value Proposition
Conectores de banco de dados nativos para **PostgreSQL** e **MySQL**, permitindo que o SQL Editor conecte-se a servidores locais (Docker, localhost) e remotos na nuvem (AWS RDS, Supabase, Neon, Render, Railway, Google Cloud SQL, PlanetScale).
O sistema implementa o **Strategy Pattern** na camada de adaptadores de banco, garantindo que operações de introspecção de catálogo (tabelas, colunas, chaves primárias e chaves estrangeiras) e execução de consultas sigam a mesma interface unificada utilizada pelo SQLite.

---

## 2. Problem Statement & Motivation
- **Limitação Prévia**: O SQL Editor operava unicamente sobre arquivos locais SQLite.
- **Necessidade dos Desenvolvedores**: O fluxo de trabalho moderno exige trabalhar com PostgreSQL e MySQL, os dois bancos relacionais de código aberto mais utilizados no mundo.
- **Transição Transparente**: O usuário já pode salvar perfis de conexão PostgreSQL e MySQL no Hub de Conexões; agora o botão "Conectar" deve estabelecer a conexão TCP real com suporte a credenciais seguras e SSL/TLS.

---

## 3. User Stories & Scenarios

### User Story 1 - Conexão e Introspecção PostgreSQL (P1)
> Como um desenvolvedor backend,  
> Quero conectar ao meu banco PostgreSQL (ex: localhost:5432),  
> Para que a sidebar liste todas as tabelas do schema `public`, suas colunas, chaves primárias e relacionamentos.

#### Cenário de Aceite 1.1: Conexão com Sucesso
- **Dado** credenciais válidas de um PostgreSQL
- **Quando** o usuário clica em "Conectar" no Hub de Conexões
- **Então** a conexão é aberta, descriptografando a senha salva via `safeStorage`, e a visualização alterna para o Workspace com as tabelas carregadas.

### User Story 2 - Conexão e Execução MySQL (P1)
> Como um desenvolvedor web,  
> Quero conectar a uma instância MySQL (porta 3306),  
> Para executar consultas `SELECT`, `SHOW TABLES`, e navegar pelas chaves estrangeiras via Peek Overlay.

### User Story 3 - Tratamento de Erros de Rede e Timeout (P2)
> Como um desenvolvedor,  
> Se o servidor remoto estiver inacessível ou a senha for inválida,  
> Quero ver uma mensagem de erro clara (ex: "ECONNREFUSED", "Autenticação falhou") sem que a aplicação trave.

---

## 4. Requisitos Funcionais

### 4.1 Adaptadores de Banco de Dados
- [ ] Implementação de `PostgresAdapter` implementando `DatabaseAdapter`.
- [ ] Implementação de `MySQLAdapter` implementando `DatabaseAdapter`.
- [ ] Mapeamento consistente de tipos de dados para `DatabaseCell` (`string`, `number`, `null`, `blob`).
- [ ] Suporte a consultas de catálogo (`tables`, `columns`, `foreignKeys`) utilizando `information_schema` e `pg_catalog`.

### 4.2 Segurança e Conexão
- [ ] Integração com `safeStorage` para descriptografar senhas no processo Main.
- [ ] Suporte a flag `ssl` (SSL/TLS habilitado ou desabilitado).
- [ ] Teste de conexão ("Testar Conexão") no Hub antes de salvar.

