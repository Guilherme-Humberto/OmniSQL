import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateMarkdownDictionary } from '../app/features/documentation/domain/dictionary-generator.ts'
import {
  generateMermaidErDiagram,
  normalizeMermaidType,
} from '../app/features/documentation/domain/mermaid-generator.ts'
import { generateSqlCommentStatements } from '../app/features/documentation/domain/sql-comment-generator.ts'
import {
  buildAiDocumenterPrompt,
  parseAiDocumenterResponse,
} from '../app/features/documentation/domain/ai-documenter-prompt.ts'
import type { TableDocumentationMeta, ColumnCommentSuggestion } from '../app/features/documentation/domain/types.ts'

const mockTables: TableDocumentationMeta[] = [
  {
    name: 'autores',
    kind: 'table',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, notNull: true },
      { name: 'nome', type: 'VARCHAR(150)', primaryKey: false, notNull: true },
      { name: 'email', type: 'VARCHAR(255)', primaryKey: false, notNull: false },
    ],
    foreignKeys: [],
  },
  {
    name: 'livros',
    kind: 'table',
    columns: [
      { name: 'id', type: 'INTEGER', primaryKey: true, notNull: true },
      { name: 'titulo', type: 'VARCHAR(200)', primaryKey: false, notNull: true },
      { name: 'autor_id', type: 'INTEGER', primaryKey: false, notNull: true },
    ],
    foreignKeys: [
      { id: 1, table: 'autores', from: 'autor_id', to: 'id' },
    ],
  },
]

test('generateMarkdownDictionary: produz documento completo em Markdown estruturado', () => {
  const markdown = generateMarkdownDictionary({
    databaseName: 'biblioteca_db',
    driver: 'postgres',
    tables: mockTables,
  })

  // Cabeçalho e metadados
  assert.match(markdown, /# 📖 Dicionário de Dados: `biblioteca_db`/)
  assert.match(markdown, /\*\*Banco de Dados\*\*: `biblioteca_db`/)
  assert.match(markdown, /\*\*Driver\*\*: `POSTGRES`/)

  // Sumário de entidades
  assert.match(markdown, /\|\s*\[\*\*`autores`\*\*\]\(#autores\)\s*\|\s*`TABELA`\s*\|\s*3\s*\|\s*-\s*\|/)
  assert.match(markdown, /\|\s*\[\*\*`livros`\*\*\]\(#livros\)\s*\|\s*`TABELA`\s*\|\s*3\s*\|\s*1 FKs\s*\|/)

  // Detalhamento e colunas
  assert.match(markdown, /### `autores`/)
  assert.match(markdown, /\|\s*`id`\s*\|\s*`INTEGER`\s*\|\s*✅\s*\|\s*\|\s*✅\s*\|/)
  assert.match(markdown, /\|\s*`nome`\s*\|\s*`VARCHAR\(150\)`\s*\|\s*\|\s*\|\s*✅\s*\|/)

  // Relacionamento com link
  assert.match(markdown, /Aponta para \[`autores\(id\)`\]\(#autores\)/)
  assert.match(markdown, /- \*\*`livros\.autor_id`\*\* ➔ \[`autores\.id`\]\(#autores\)/)
})

test('generateMermaidErDiagram: formata sintaxe erDiagram e normaliza tipos de atributos', () => {
  assert.equal(normalizeMermaidType('VARCHAR(255)'), 'string')
  assert.equal(normalizeMermaidType('INTEGER'), 'int')
  assert.equal(normalizeMermaidType('BOOLEAN'), 'boolean')
  assert.equal(normalizeMermaidType('TIMESTAMP WITH TIME ZONE'), 'datetime')

  const mermaid = generateMermaidErDiagram(mockTables)

  assert.match(mermaid, /^erDiagram/)
  assert.match(mermaid, /autores\s*\{/)
  assert.match(mermaid, /int id PK/)
  assert.match(mermaid, /string nome/)
  assert.match(mermaid, /livros\s*\{/)
  assert.match(mermaid, /int autor_id FK/)

  // Relacionamento Pai ||--o{ Filho
  assert.match(mermaid, /autores \|\|--o\{ livros : "autor_id"/)
})

test('generateSqlCommentStatements: gera instruções DDL compatíveis com PostgreSQL e MySQL', () => {
  const suggestions: ColumnCommentSuggestion[] = [
    {
      tableName: 'clientes',
      columnName: 'dt_nsc',
      columnType: 'DATE',
      suggestedComment: "Data de nascimento do cliente d'água",
      approved: true,
    },
    {
      tableName: 'clientes',
      columnName: 'flg_ativo',
      columnType: 'BOOLEAN',
      suggestedComment: 'Status ativo',
      approved: false, // Desmarcado pelo usuário
    },
  ]

  // PostgreSQL
  const pgSql = generateSqlCommentStatements('postgres', suggestions)
  assert.match(pgSql, /COMMENT ON COLUMN "clientes"\."dt_nsc" IS 'Data de nascimento do cliente d''água';/)
  assert.equal(pgSql.includes('flg_ativo'), false) // Reprovado não entra

  // MySQL
  const mysqlSql = generateSqlCommentStatements('mysql', suggestions)
  assert.match(mysqlSql, /ALTER TABLE `clientes` MODIFY COLUMN `dt_nsc` DATE COMMENT 'Data de nascimento do cliente d''água';/)

  // SQLite (comentários descritivos)
  const sqliteSql = generateSqlCommentStatements('sqlite', suggestions)
  assert.match(sqliteSql, /-- \[clientes\.dt_nsc\]: Data de nascimento do cliente d''água/)
})

test('buildAiDocumenterPrompt e parseAiDocumenterResponse: extrai descrições sem expor dados', () => {
  const input = [
    {
      tableName: 'usuarios',
      columns: [
        { name: 'flg_actv_usr', type: 'BOOLEAN' },
        { name: 'dt_cad_usr', type: 'TIMESTAMP' },
      ],
    },
  ]

  const { systemPrompt, userPrompt } = buildAiDocumenterPrompt(input)
  assert.match(systemPrompt, /especialista em documentação de bancos de dados/)
  assert.match(userPrompt, /"flg_actv_usr"/)

  const aiJsonResponse = `
Aqui estão as descrições sugeridas:
\`\`\`json
[
  {"tableName": "usuarios", "columnName": "flg_actv_usr", "description": "Sinalizador se o usuário está ativo"},
  {"tableName": "usuarios", "columnName": "dt_cad_usr", "description": "Data de cadastro do usuário no sistema"}
]
\`\`\`
`

  const parsed = parseAiDocumenterResponse(aiJsonResponse, input)
  assert.equal(parsed.length, 2)
  assert.equal(parsed[0]?.columnName, 'flg_actv_usr')
  assert.equal(parsed[0]?.suggestedComment, 'Sinalizador se o usuário está ativo')
  assert.equal(parsed[0]?.approved, true)
  assert.equal(parsed[1]?.columnName, 'dt_cad_usr')
  assert.equal(parsed[1]?.suggestedComment, 'Data de cadastro do usuário no sistema')
})
