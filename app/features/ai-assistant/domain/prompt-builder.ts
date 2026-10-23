import type { AiGenerateInput, AiTableSummary } from '../../../../conveyor/ai-contracts'

export const SupportedDriver = {
  SQLite: 'sqlite',
  PostgreSQL: 'postgres',
  MySQL: 'mysql',
} as const

export const PromptAiMode = {
  Query: 'query',
  Modeling: 'modeling',
} as const

const DIALECT_LABELS: Record<string, string> = {
  [SupportedDriver.PostgreSQL]: 'PostgreSQL',
  [SupportedDriver.MySQL]: 'MySQL',
  [SupportedDriver.SQLite]: 'SQLite',
}

/**
 * Converte um resumo de tabelas e colunas em uma representação textual concisa
 * no estilo DDL simplificado para fornecer contexto ao modelo LLM sem vazar dados.
 */
export function formatSchemaForPrompt(tables?: AiTableSummary[]): string {
  if (!tables || tables.length === 0) {
    return 'Nenhuma tabela existente no banco ativo.'
  }

  return tables
    .map((table) => {
      const cols = table.columns
        .map((col) => {
          let def = `${col.name} ${col.type}`
          if (col.isPrimaryKey) def += ' [PK]'
          if (col.notNull) def += ' NOT NULL'
          return def
        })
        .join(', ')
      return `- ${table.name} (${cols})`
    })
    .join('\n')
}

/**
 * Monta o prompt completo e instruções de sistema para o Ollama
 * garantindo aderência ao dialeto do banco e foco exclusivo em assessoria técnica.
 */
export function buildAiPrompt(input: AiGenerateInput): { systemPrompt: string; userPrompt: string } {
  const schemaContext = formatSchemaForPrompt(input.schema)
  const dialect = DIALECT_LABELS[input.driver] || 'SQL'

  if (input.mode === PromptAiMode.Modeling) {
    const systemPrompt = `Você é um Arquiteto de Banco de Dados sênior especializado em modelagem relacional para ${dialect}.
Sua função é criar especificações DDL (CREATE TABLE, ALTER TABLE, índices, chaves estrangeiras e constraints).
REGRAS OBRIGATÓRIAS:
1. Gere código DDL rigorosamente compatível com a sintaxe do ${dialect}.
2. Adicione chaves primárias adequadas, índices em colunas frequentemente consultadas e constraints de integridade referencial.
3. Não use comandos destrutivos (como DROP TABLE) a menos que explicitamente solicitado.
4. Apresente todo o código SQL dentro de um bloco de código markdown (\`\`\`sql ... \`\`\`).
5. Forneça uma explicação concisa em português após o bloco de código justificando as decisões de modelagem.`

    const userPrompt = `DIALETO: ${dialect}
ESQUEMA ATUAL DO BANCO:
${schemaContext}

SOLICITAÇÃO DE MODELAGEM:
${input.prompt}`

    return { systemPrompt, userPrompt }
  }

  // Modo Consulta Analítica (Padrão)
  const systemPrompt = `Você é um Assistente Especialista em SQL focado em análise de dados e consultas para o banco ${dialect}.
Sua função é gerar consultas SELECT precisas, performáticas e otimizadas.
DIRETRIZES DE SEGURANÇA E PRIVACIDADE INEGOCIÁVEIS:
1. NUNCA gere comandos de modificação de dados ou esquemas (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE).
2. Se o usuário solicitar qualquer operação de escrita, recuse educadamente explicando que seu modo é exclusivamente de consulta.
3. Responda incluindo a consulta SQL dentro de um bloco markdown (\`\`\`sql ... \`\`\`).
4. Após o código, inclua uma breve explicação do funcionamento dos JOINs e agregações utilizadas.`

  const userPrompt = `DIALETO: ${dialect}
ESQUEMA DO BANCO DISPONÍVEL:
${schemaContext}

PERGUNTA / SOLICITAÇÃO DE CONSULTA:
${input.prompt}`

  return { systemPrompt, userPrompt }
}
