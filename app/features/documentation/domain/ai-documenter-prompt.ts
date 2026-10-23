import type { ColumnCommentSuggestion } from './types'

export interface TableColumnsToDocument {
  tableName: string
  columns: Array<{ name: string; type?: string }>
}

/**
 * Constrói os prompts de sistema e usuário para inferir descrições semânticas de colunas via Ollama local.
 * Envia estritamente o catálogo estrutural (nomes de tabelas e colunas), sem jamais expor dados de linhas.
 */
export function buildAiDocumenterPrompt(tables: TableColumnsToDocument[]): {
  systemPrompt: string
  userPrompt: string
} {
  const systemPrompt = `Você é um DBA e Arquiteto de Software especialista em documentação de bancos de dados.
Sua missão é analisar nomes de tabelas e colunas (muitas vezes abreviados ou legados como flg_actv, dt_nsc, cod_cli, vl_tot) e gerar descrições semânticas claras, elegantes e objetivas em português.

Regras Estritas:
1. Responda EXCLUSIVAMENTE com um array JSON válido sem texto conversacional antes ou depois.
2. Cada item do JSON deve ter as chaves: "tableName", "columnName", "description".
3. A "description" deve ser uma frase concisa em português explicando o propósito do campo (máximo 80 caracteres).
4. Exemplo de saída:
[
  {"tableName": "clientes", "columnName": "dt_nsc_cli", "description": "Data de nascimento do cliente"},
  {"tableName": "usuarios", "columnName": "flg_actv", "description": "Indica se o usuário está com cadastro ativo"}
]`

  const userPrompt = `Analise as seguintes tabelas e colunas estruturais e gere as descrições sugeridas em JSON:

${JSON.stringify(tables, null, 2)}`

  return { systemPrompt, userPrompt }
}

/**
 * Faz o parsing seguro da resposta do LLM, extraindo o array de sugestões JSON.
 */
export function parseAiDocumenterResponse(
  rawText: string,
  fallbackTables: TableColumnsToDocument[]
): ColumnCommentSuggestion[] {
  // 1. Tenta extrair bloco json ```json ... ```
  let cleanJson = rawText.trim()
  const codeBlockMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleanJson = codeBlockMatch[1].trim()
  }

  // 2. Localiza o primeiro [ e último ]
  const firstBracket = cleanJson.indexOf('[')
  const lastBracket = cleanJson.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleanJson = cleanJson.slice(firstBracket, lastBracket + 1)
  }

  try {
    const parsed = JSON.parse(cleanJson) as Array<{ tableName: string; columnName: string; description: string }>
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        const table = fallbackTables.find((t) => t.tableName === item.tableName)
        const col = table?.columns.find((c) => c.name === item.columnName)
        return {
          tableName: String(item.tableName || ''),
          columnName: String(item.columnName || ''),
          columnType: col?.type,
          suggestedComment: String(item.description || '').trim(),
          approved: true,
        }
      })
    }
  } catch {
    // Se o modelo falhar ao gerar JSON estrito, gera sugestões vazias para edição manual
  }

  const suggestions: ColumnCommentSuggestion[] = []
  for (const table of fallbackTables) {
    for (const col of table.columns) {
      suggestions.push({
        tableName: table.tableName,
        columnName: col.name,
        columnType: col.type,
        suggestedComment: `Campo ${col.name} da tabela ${table.tableName}`,
        approved: true,
      })
    }
  }
  return suggestions
}

