# Feature Specification: Database Documentation Suite (Dicionário, Mermaid ER & IA Local)

**Feature ID**: `008-database-documentation-suite`  
**Status**: `Draft`  
**Created**: `2026-10-23`  

---

## 1. Visão Geral e Contexto de Negócio

A documentação técnica de esquemas de banco de dados é um dos maiores gargalos em equipes de engenharia. A maioria das ferramentas existentes gera arquivos PDF obsoletos, proprietários ou diagramas gráficos lentos e pesados (como no MySQL Workbench).

Esta feature introduz uma **Suíte Moderna de Documentação de Banco de Dados** em 3 pilares integrados:
1. **Dicionário de Dados em 1 Clique (Markdown / Notion)**: Gera um documento completo, limpo e padronizado em Markdown puro, pronto para ser colado diretamente no Notion, GitHub, GitLab, Obsidian ou MkDocs.
2. **Diagramas ER Leves via Mermaid.js**: Converte todas as tabelas, colunas, tipos e chaves estrangeiras em diagramas `erDiagram` baseados em texto, renderizados nativamente por plataformas modernas de documentação e versionáveis no Git.
3. **Auto-Documentador Semântico com IA Local (Ollama)**: Utiliza modelos de IA offline locais para analisar siglas e nomes crípticos de colunas (ex: `flg_actv_usr`, `dt_nsc_cli`), inferir descrições em linguagem natural e gerar comandos nativos `COMMENT ON` para enriquecer permanentemente o catálogo do banco.

---

## 2. Personas e Casos de Uso

### Persona: Engenheiro de Software / Tech Lead
> *"Preciso documentar o modelo de dados de um novo microsserviço no Notion da empresa sem perder horas criando tabelas manuais ou tirando prints de diagramas."*

### Persona: DBA / Engenheiro de Dados
> *"Recebi um banco legado com nomes de colunas abreviados dos anos 90 e preciso entender e documentar o significado de cada campo com apoio de IA sem expor os dados para a nuvem."*

---

## 3. Requisitos Funcionais

### 3.1 Geração de Dicionário de Dados (Markdown)
- Ler todas as tabelas, tipos de colunas, restrições (`PRIMARY KEY`, `NOT NULL`) e chaves estrangeiras (`FOREIGN KEY`).
- Gerar tabela de índice de entidades e seções estruturadas para cada tabela.
- Indicar visualmente relacionamentos e tabelas pai/filho.
- Suporte a cópia com um clique para a área de transferência e download em `.md`.

### 3.2 Diagrama Entidade-Relacionamento (Mermaid.js)
- Mapear tabelas em blocos de entidades Mermaid `erDiagram`.
- Representar colunas com tipos simplificados (`int`, `string`, `datetime`, `boolean`) e badges `PK`/`FK`.
- Gerar relacionamentos direcionais com cardinalidade `||--o{` baseados nas chaves estrangeiras do catálogo.
- Cópia com um clique e exportação em `.mmd` ou bloco ` ```mermaid `.

### 3.3 Auto-Documentador com IA Local (Ollama)
- Conectar ao daemon local do Ollama (`http://127.0.0.1:11434`) com total privacidade (zero tráfego para provedores de nuvem).
- Inferir o significado de nomes crípticos de colunas (ex: `flg_bloq` -> *"Flag indicando se o registro está bloqueado"*).
- Interface de revisão interativa onde o usuário pode aprovar ou editar cada descrição sugerida.
- Gerar e aplicar comandos `COMMENT ON COLUMN` (Postgres) ou `MODIFY COLUMN ... COMMENT` (MySQL) diretamente no banco.

---

## 4. Critérios de Aceite

- [x] O usuário pode abrir o modal de documentação a partir do banco de dados ativo no workspace.
- [x] O Dicionário de Dados Markdown é gerado instantaneamente e pode ser copiado ou baixado.
- [x] O Diagrama Mermaid.js gera sintaxe válida sem quebras de layout.
- [x] O Auto-Documentador IA funciona offline com Ollama e gera scripts `COMMENT ON` executáveis.
- [x] Conformidade integral com os portões de qualidade (`typecheck`, `lint:check`, `test:sqlite`).

