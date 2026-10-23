# OmniSql

Aplicativo desktop para gerenciamento de bancos de dados e consultas SQL, desenvolvido com Electron, React e TypeScript. A interface utiliza styled-components.

## Fases

- Fase 1: workspace SQL, multiplas abas e conexao local SQLite.
- Fase 2: conexoes PostgreSQL/MySQL e persistencia local segura.
- Fase 3: historico, consultas salvas e edicao de dados.

O acesso ao SQLite usa `node:sqlite` no processo principal. Essa API ainda e experimental no Node 24.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Verificacoes

```bash
npm run typecheck
npm run lint:check
npm run format:check
npm run test:sqlite
```

A comunicacao entre a interface e os processos do Electron usa Electron Conveyor. Acesso a drivers e recursos locais deve permanecer no processo principal, exposto ao renderer por IPC tipado.
