# Feature Specification: Exportação com Data Masking (Anonimização LGPD / GDPR)

**Feature ID**: `007-data-masking-export`  
**Status**: `Draft`  
**Created**: `2026-10-23`  

---

## 1. Visão Geral e Contexto de Negócio

Desenvolvedores e analistas de dados frequentemente precisam extrair resultados de consultas em bancos de dados de produção ou homologação para testes locais, depuração, geração de relatórios ou compartilhamento com terceiros. No entanto, regulamentações rigorosas de privacidade como **LGPD** (Brasil) e **GDPR** (União Europeia) proíbem a disseminação de Informações de Identificação Pessoal (PII) sem o devido consentimento ou anonimização.

Esta feature introduz um pipeline de exportação com **Data Masking Inteligente**, permitindo identificar automaticamente colunas com dados sensíveis (e-mails, CPFs/CNPJs, telefones, senhas, cartões, nomes) e aplicar regras configuráveis de mascaramento parcial, substituição por dados sintéticos consistentes, hash unidirecional ou anonimização total (`NULL`) antes de salvar em **CSV, JSON ou SQL INSERTs**.

---

## 2. Personas e Histórias de Usuário

### Persona: Engenheiro de Software / DBA em Conformidade LGPD
> *"Como desenvolvedor trabalhando com dados reais, quero exportar o resultado de uma consulta mascarando automaticamente CPFs, senhas e e-mails para que eu possa reproduzir bugs localmente sem violar as políticas de segurança e privacidade da empresa."*

### Persona: Analista de Negócios / QA
> *"Como analista de dados, quero exportar uma massa de dados sintética derivada de uma consulta complexa para alimentar ambientes de homologação mantendo a consistência dos formatos sem expor clientes reais."*

---

## 3. Requisitos Funcionais

1. **Sistema Dinâmico de Tags Sensíveis por Banco de Dados**:
   - Cada banco de dados possui seu próprio dicionário de palavras-chave (tags) configuráveis por categoria (`email`, `cpf_cnpj`, `phone`, `password`, `name`, `credit_card`, `address`, `generic`).
   - O usuário pode adicionar novas tags personalizadas (ex: `chave_pix`, `matricula`, `tax_id`), remover tags existentes ou restaurar os valores padrão do sistema.
   - Correspondência inteligente (`matchesColumnTag`) que identifica tags com delimitadores comuns (`snake_case`, `kebab-case`, `camelCase`, espaços) sem falsos positivos.

2. **Políticas de Anonimização Configuráveis por Coluna**:
   - `none`: Mantém o dado original.
   - `mask`: Mascaramento parcial preservando formato (ex: `j***e@dominio.com`, `123.***.***-01`, `(11) 9****-9999`).
   - `fake`: Geração de dado sintético consistente (ex: `anon_user_1@exemplo.com`, CPF gerado/falso válido em formato, `Nome Fictício 1`).
   - `hash`: Hash unidirecional truncado (ex: SHA-256 de 8 caracteres alfanuméricos).
   - `null`: Ocultar totalmente (substituir por valor `NULL`).

3. **Formatos de Exportação Suportados**:
   - **CSV**: Delimitador configurável (vírgula ou ponto-e-vírgula), escape correto de aspas e quebras de linha.
   - **JSON**: Formato legível ou minificado, com tipagem preservada de números e booleanos.
   - **SQL (INSERTs)**: Instruções `INSERT INTO [tabela] (colunas) VALUES (...)` prontas para restauração ou seeding.

4. **Visualização Prévia (Preview) em Tempo Real**:
   - Amostra imediata das primeiras 3 a 5 linhas processadas de acordo com as regras ativas antes do download.

5. **Download Local do Arquivo**:
   - Geração do arquivo em memória via Blob e acionamento de download nativo com nome amigável sugerido.

---

## 4. Critérios de Aceite

- [x] O usuário pode clicar no botão "Exportar" no painel de resultados com dados ativos.
- [x] O sistema detecta automaticamente colunas com dados sensíveis e sugere máscaras pré-definidas.
- [x] O usuário pode alterar individualmente a estratégia de cada coluna ou usar o botão "Mascarar Todas as Sensíveis".
- [x] O preview em tempo real reflete instantaneamente qualquer alteração de formato ou regra.
- [x] Arquivos CSV, JSON e SQL são gerados corretamente e respeitam caracteres especiais e nulos.
- [x] 100% de conformidade com os quality gates do projeto (`npm run typecheck`, `npm run lint:check`, `npm run test:sqlite`).

