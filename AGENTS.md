# AGENTS.md — Diretrizes de Engenharia e Guardrails para Agentes de IA

Este documento é a **referência mandatória e vinculativa** para qualquer Agente de Inteligência Artificial (AI Agent, Claude, Copilot, Gemini, Cursor, etc.) que leia, edite, gere ou refatore código no repositório **SQL Editor**.

> ⚠️ **REGRA DE OURO**: Nenhum código gerado por IA pode ser considerado finalizado sem atender rigorosamente aos portões de qualidade, testabilidade e segurança aqui especificados. É expressamente proibido o desenvolvimento empírico sem especificações (*vibecoding*).

---

## 1. Princípios Arquiteturais e Estrutura de Código

### 1.1 Clean Architecture e Separação Estrita de Camadas
A aplicação é dividida em três camadas isoladas. Nunca viole os limites de responsabilidade:
1. **Camada de Apresentação (`app/`)**:
   - Componentes React 19 desacoplados.
   - **Zero acesso direto a APIs nativas do Node.js** (como `fs`, `child_process`, `net`, `sqlite`). Todo o contato com o sistema operacional ocorre exclusivamente via IPC tipado pelo **Electron Conveyor** (`conveyor/`).
2. **Camada de Domínio (`domain/`, `features/*/domain/`)**:
   - Código puro em TypeScript sem qualquer dependência de React, DOM, Electron ou bibliotecas de interface.
   - Contém modelos, regras de negócio, heurísticas analíticas, algoritmos matemáticos, inferência de tipos e cálculo de KPIs.
3. **Camada de Infraestrutura e Main Process (`lib/main/`, `conveyor/`, `lib/worker/`)**:
   - Ciclo de vida do Electron, diálogos nativos do sistema (`dialog`), armazenamento seguro (`safeStorage`).
   - **Worker Threads (`database-worker.ts`)**: Operações pesadas de I/O, parsing e consultas de banco de dados **devem rodar obrigatoriamente em worker threads**, garantindo 60fps na interface e zero travamento no loop de eventos.

### 1.2 Regra de Ouro de Componentes e Estilos
- **Proibição de Arquivos Monolíticos**: Nunca coloque definições de styled-components ou regras de CSS dentro do mesmo arquivo que contém o componente JSX/TSX.
- **Padrão de Pastas Obrigatório**: Todo componente React deve residir em sua própria pasta com a estrutura:
  ```text
  [NomeDoComponente]/
  ├── index.tsx   # Lógica do componente, hooks, subscrição de stores e árvore JSX
  └── styles.ts   # Todos os styled-components, animações e constantes CSS
  ```
- **Temas e Cores**: Use sempre as variáveis CSS globais do design system (`var(--surface)`, `var(--brand)`, `var(--foreground)`, `var(--border)`). É proibido o uso de cores hexadecimais soltas ou estilos inline hardcoded em JSX, exceto para cálculos dinâmicos de geometria vetorial (SVG).

### 1.3 Proibição Absoluta de Magic Values (Valores Hardcoded)
- **Centralização Obrigatória**: Nenhuma string de tipo, número de porta de rede, timeout, limite de paginação ou constante operacional pode ser inserida diretamente no código de negócio ou visual.
- Toda constante global deve ser registrada e consumida a partir de [`app/constants/app-constants.ts`](file:///home/guilherme/Documentos/projetos/sql-editor/app/constants/app-constants.ts) ou do arquivo `constants.ts` específico do domínio.
- Sempre utilize `enum` ou `as const` tipados (ex: `DatabaseDriver`, `AppView`, `ChartType`, `DEFAULT_DATABASE_PORTS`).

### 1.4 Aplicação Prática dos Princípios SOLID
- **Single Responsibility (SRP)**: Cada módulo, hook ou componente deve ter uma única razão para mudar. Separe apresentação visual de lógica de estado.
- **Open/Closed (OCP)**: Módulos extensíveis (como geradores de código ORM e adaptadores de banco de dados) devem usar o **Strategy Pattern**. Adicionar um novo banco ou ORM deve exigir apenas uma nova classe, sem modificar o código existente.
- **Dependency Inversion (DIP)**: O frontend depende exclusivamente de contratos tipados de interface (`conveyor/*-contracts.ts`), nunca de implementações concretas do Electron.

---

## 2. Portões de Qualidade Inegociáveis (Quality Gates)

Antes de reportar a conclusão de qualquer tarefa, o agente **DEVE executar e validar os três portões de qualidade**:

```bash
# Execução da suíte completa de portões de qualidade
yarn typecheck && yarn lint:check && yarn test:sqlite
```

| Portão | Comando | Critério de Aceite |
| :--- | :--- | :--- |
| **Portão 1: Tipagem Estrita** | `yarn typecheck` | **Zero erros** (`tsc --noEmit` em `tsconfig.node.json` e `tsconfig.web.json`). Proibido o uso de `any` sem justificativa formal. |
| **Portão 2: Análise Estática** | `yarn lint:check` | **Zero avisos ou erros** de ESLint. Respeito estrito às regras de hooks do React. |
| **Portão 3: Testes Automatizados** | `yarn test:sqlite` | **100% de sucesso** nos testes de adaptadores, workers, joins e serialização de dados. |

> ❌ **Falha em qualquer portão**: Se qualquer um dos comandos falhar, a tarefa está em estado inválido. O agente deve corrigir a causa raiz antes de prosseguir.

---

## 3. Diretrizes de Testabilidade e Cobertura

1. **Design Testável por Padrão**:
   - Todo algoritmo de negócio (transformação de dados, formatadores, analisadores de SQL, inferência de tipos de ORM) deve ser isolado como **função pura** em arquivos de domínio. Funções puras dispensam mocks complexos e rodam em milissegundos.
2. **Cenários de Borda Obrigatórios**:
   - Valores nulos (`NULL`), strings vazias, valores indefinidos (`undefined`).
   - Dados binários e BLOBs (verificar serialização segura sem quebrar o transporte IPC).
   - Nomes de colunas duplicados originados de `JOIN`s complexos.
   - Volumes elevados de registros (verificar que a paginação via `LIMIT` e `OFFSET` não consome toda a memória).
   - Timeout de rede e conexões abortadas.
3. **Novas Funcionalidades**:
   - Toda nova funcionalidade de domínio ou backend deve ser acompanhada de seus respectivos testes unitários em `tests/`.

---

## 4. Segurança e Privacidade (Privacy-First & Zero-Trust)

### 4.1 Criptografia Mandatória de Credenciais
- **Senhas de Banco de Dados**: É terminantemente proibido gravar senhas em texto puro em arquivos de configuração, logs, local storage ou banco SQLite interno.
- As senhas devem ser obrigatoriamente encriptadas no processo Main utilizando `electron.safeStorage.encryptString()`, aproveitando os mecanismos nativos do sistema operacional (DPAPI no Windows, Keychain no macOS e Secret Service / libsecret no Linux).
- O transporte de credenciais deve ser protegido por DTOs específicos (`ConnectionRecord` omite a senha decodificada na listagem).

### 4.2 Privacidade e Princípio Local-First
- **Inteligência Artificial (Text-to-SQL)**: Nenhuma estrutura de tabela, DDL, consulta SQL ou dado de cliente pode ser trafegado para provedores externos de IA na nuvem (OpenAI, Anthropic, etc.). Todo recurso de IA deve ser direcionado para o daemon local do **Ollama** (`http://127.0.0.1:11434`).
- **Conformidade LGPD / GDPR**: Scripts e rotinas de exportação de dados com fins de teste devem prever mascaramento e anonimização de dados pessoais (`email`, `cpf`, `phone`, `password`).

### 4.3 Isolamento do Processo Electron
- Manter estritamente habilitado `contextIsolation: true` e `nodeIntegration: false`.
- O preload script deve expor apenas a ponte IPC do Electron Conveyor devidamente sanitizada.
- Nunca utilize `eval()` ou construção insegura de strings executadas diretamente como comandos de shell.

---

## 5. Integração com o GitHub Spec Kit (Processo SDD)

O projeto adota o **GitHub Spec Kit** (`.specify/` e `specs/`) como padrão oficial de desenvolvimento. O agente deve seguir este protocolo:

1. **Consulta Prévia**: Antes de alterar código, leia a constituição do projeto em [`.specify/memory/constitution.md`](file:///home/guilherme/Documentos/projetos/sql-editor/.specify/memory/constitution.md).
2. **Ciclo de Especificação de Novas Features**:
   - Toda nova feature deve possuir sua pasta dedicada em `specs/[###-nome-da-feature]/`.
   - `spec.md`: Requisitos de negócio, user stories e critérios de aceite gerados a partir de [`.specify/templates/spec-template.md`](file:///home/guilherme/Documentos/projetos/sql-editor/.specify/templates/spec-template.md).
   - `plan.md`: Arquitetura técnica, diagramas de sequência Mermaid e contratos TypeScript gerados a partir de [`.specify/templates/plan-template.md`](file:///home/guilherme/Documentos/projetos/sql-editor/.specify/templates/plan-template.md).
   - `tasks.md`: Lista acionável de subtarefas técnicas divididas em Domínio, Backend, UI e Testes geradas a partir de [`.specify/templates/tasks-template.md`](file:///home/guilherme/Documentos/projetos/sql-editor/.specify/templates/tasks-template.md).
3. **Preservação de Integridade**:
   - Nunca remova comentários explicativos ou documentações funcionais existentes no código.
   - Nunca quebre funcionalidades existentes ao implementar uma nova feature.

---

## 6. Checklist de Auto-Avaliação do Agente

Antes de submeter o código ou solicitar feedback do usuário, responda afirmativamente a cada item:

- [ ] Separei todos os estilos em `styles.ts` e a lógica em `index.tsx` dentro da pasta do componente?
- [ ] Eliminei todos os números mágicos e strings literais soltas, movendo-os para constantes ou enums?
- [ ] A lógica de banco de dados pesada está sendo executada em Worker Thread sem travar a interface?
- [ ] As senhas e dados sensíveis estão criptografados via `safeStorage`?
- [ ] Executei `yarn typecheck` e obtive **zero erros**?
- [ ] Executei `yarn lint:check` e obtive **zero erros**?
- [ ] Executei `yarn test:sqlite` e todos os testes passaram?
- [ ] Atualizei a documentação correspondente em `specs/`?

