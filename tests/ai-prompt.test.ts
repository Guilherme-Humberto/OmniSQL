import test from 'node:test'
import assert from 'node:assert/strict'
import { formatSchemaForPrompt, buildAiPrompt } from '../app/features/ai-assistant/domain/prompt-builder.ts'
import { parseAiResponse } from '../app/features/ai-assistant/domain/response-parser.ts'

test('formata esquema para o prompt sem incluir dados confidenciais de linhas', () => {
  const schema = [
    {
      name: 'pedidos',
      columns: [
        { name: 'id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'cliente_id', type: 'INTEGER', notNull: true },
        { name: 'total', type: 'DECIMAL(10,2)' },
      ],
    },
  ]

  const formatted = formatSchemaForPrompt(schema)
  assert.ok(formatted.includes('- pedidos (id INTEGER [PK], cliente_id INTEGER NOT NULL, total DECIMAL(10,2))'))
})

test('monta prompt para modo consulta com instruções de segurança', () => {
  const { systemPrompt, userPrompt } = buildAiPrompt({
    prompt: 'Liste os 5 maiores pedidos por total',
    mode: 'query',
    driver: 'postgres',
    model: 'qwen2.5-coder',
  })

  assert.ok(systemPrompt.includes('PostgreSQL'))
  assert.ok(systemPrompt.includes('NUNCA gere comandos de modificação'))
  assert.ok(userPrompt.includes('Liste os 5 maiores pedidos por total'))
})

test('monta prompt para modo modelagem DDL', () => {
  const { systemPrompt, userPrompt } = buildAiPrompt({
    prompt: 'Crie uma tabela de cupons de desconto',
    mode: 'modeling',
    driver: 'sqlite',
    model: 'deepseek-coder',
  })

  assert.ok(systemPrompt.includes('SQLite'))
  assert.ok(systemPrompt.includes('CREATE TABLE'))
  assert.ok(userPrompt.includes('Crie uma tabela de cupons de desconto'))
})

test('extrai bloco SQL e explicação de resposta markdown do LLM', () => {
  const rawResponse = `Aqui está a consulta gerada para buscar os clientes:
\`\`\`sql
SELECT c.id, c.nome, SUM(p.total) as total_gasto
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.id, c.nome
ORDER BY total_gasto DESC
LIMIT 5;
\`\`\`
Esta consulta agrupa os pedidos por cliente e ordena de forma decrescente.`

  const parsed = parseAiResponse(rawResponse)
  assert.ok(parsed.sql.startsWith('SELECT c.id, c.nome'))
  assert.ok(parsed.sql.endsWith('LIMIT 5;'))
  assert.ok(parsed.explanation.includes('Esta consulta agrupa os pedidos'))
})

test('extrai SQL puro caso o modelo não use blocos de código', () => {
  const rawResponse = 'SELECT * FROM usuarios WHERE ativo = 1;'
  const parsed = parseAiResponse(rawResponse)
  assert.equal(parsed.sql, 'SELECT * FROM usuarios WHERE ativo = 1;')
})
