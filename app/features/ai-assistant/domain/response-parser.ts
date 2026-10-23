export interface ParsedAiResponse {
  sql: string
  explanation: string
}

/**
 * Extrai o código SQL e o texto explicativo da resposta gerada pelo LLM.
 */
export function parseAiResponse(rawText: string): ParsedAiResponse {
  if (!rawText || !rawText.trim()) {
    return {
      sql: '',
      explanation: 'Nenhuma resposta retornada pelo modelo.',
    }
  }

  // Regex para capturar blocos ```sql ... ``` ou ``` ... ```
  const codeBlockRegex = /```(?:sql)?\s*([\s\S]*?)```/i
  const match = rawText.match(codeBlockRegex)

  if (match && match[1]) {
    const sql = match[1].trim()
    // O texto explicativo é o conteúdo antes e/ou depois do bloco de código
    const explanation = rawText
      .replace(match[0], '')
      .trim()
      // Remove linhas em branco excessivas
      .replace(/\n{3,}/g, '\n\n')

    return {
      sql,
      explanation: explanation || 'Consulta gerada com base nos parâmetros solicitados.',
    }
  }

  // Se o modelo respondeu diretamente com SQL sem blocos de markdown
  const trimmed = rawText.trim()
  const startsWithSql = /^(SELECT|WITH|CREATE|ALTER|INSERT|UPDATE|DELETE|EXPLAIN|PRAGMA)\b/i.test(trimmed)

  if (startsWithSql) {
    return {
      sql: trimmed,
      explanation: 'Consulta gerada pelo modelo local.',
    }
  }

  // Fallback: texto não estruturado
  return {
    sql: '',
    explanation: trimmed,
  }
}

