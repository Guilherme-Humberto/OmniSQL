# Implementation Tasks: Exportação com Data Masking (LGPD / GDPR)

**Feature ID**: `007-data-masking-export`  
**Status**: `Completed`  
**Plan Reference**: `plan.md`  

---

## Task Group 1: Tipagem e Domínio Puro de Mascaramento
- [x] Task 1.1: Criar `app/features/data-masking/domain/masking-types.ts` com tipos de regras, dados sensíveis e formatos de exportação.
- [x] Task 1.2: Criar `app/features/data-masking/domain/heuristic-detector.ts` para detecção de colunas sensíveis baseada em regex e nomes.
- [x] Task 1.3: Criar `app/features/data-masking/domain/masking-engine.ts` com funções puras de anonimização (parcial, fake, hash, null).
- [x] Task 1.4: Criar `app/features/data-masking/domain/export-serializers.ts` para serializar linhas mascaradas em CSV, JSON e SQL INSERTs.

---

## Task Group 2: Componentes de Apresentação (Clean Architecture & Isolated Styles)
- [x] Task 2.1: Criar constantes e enums em `app/features/data-masking/constants.ts`.
- [x] Task 2.2: Criar `app/features/data-masking/components/export-masking-modal/styles.ts` com styled-components desacoplados e variáveis CSS.
- [x] Task 2.3: Criar `app/features/data-masking/components/export-masking-modal/index.tsx` com formulário de configuração, preview de dados e download de arquivos.
- [x] Task 2.4: Integrar botão "Exportar" com modal no painel de resultados `app/components/query-results/index.tsx`.

---

## Task Group 3: Testes Automatizados e Portões de Qualidade
- [x] Task 3.1: Criar `tests/data-masking.test.ts` cobrindo detecção de PII, regras de anonimização e exportação de CSV/JSON/SQL.
- [x] Task 3.2: Validar `npm run typecheck` (zero erros).
- [x] Task 3.3: Validar `npm run lint:check` (zero erros).
- [x] Task 3.4: Validar `npm run test:sqlite` (100% de sucesso em toda a suíte).
