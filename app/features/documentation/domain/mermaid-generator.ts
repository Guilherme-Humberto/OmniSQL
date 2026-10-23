import type { TableDocumentationMeta } from './types'

/**
 * Normaliza o tipo de dado SQL para um identificador de tipo limpo aceito pelo Mermaid ER.
 * O Mermaid não permite parênteses como VARCHAR(255) nos tipos de atributos.
 */
export function normalizeMermaidType(rawType: string): string {
  const clean = rawType.trim().toLowerCase().split('(')[0]?.trim() || 'string'

  if (/int|serial|bigint|tinyint|smallint/i.test(clean)) return 'int'
  if (/char|text|varchar|string/i.test(clean)) return 'string'
  if (/bool/i.test(clean)) return 'boolean'
  if (/date|time|timestamp/i.test(clean)) return 'datetime'
  if (/float|double|decimal|numeric|real/i.test(clean)) return 'float'
  if (/blob|bytea|binary/i.test(clean)) return 'blob'
  if (/json/i.test(clean)) return 'json'

  return clean.replace(/[^a-zA-Z0-9_]/g, '') || 'string'
}

/**
 * Higieniza o nome de uma entidade para identificadores válidos no Mermaid.
 */
function sanitizeEntityName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * Gera a especificação de diagrama Entidade-Relacionamento no formato padrão Mermaid.js (erDiagram).
 */
export function generateMermaidErDiagram(tables: TableDocumentationMeta[]): string {
  const lines: string[] = ['erDiagram']
  const relationships: string[] = []

  // 1. Renderiza cada entidade e seus atributos
  for (const table of tables) {
    const entityName = sanitizeEntityName(table.name)
    lines.push(`  ${entityName} {`)

    for (const col of table.columns) {
      const type = normalizeMermaidType(col.type)
      const colName = col.name.replace(/[^a-zA-Z0-9_]/g, '_')

      const isPk = col.primaryKey
      const isFk = table.foreignKeys.some((f) => f.from === col.name)

      let keyFlag = ''
      if (isPk && isFk) keyFlag = ' PK,FK'
      else if (isPk) keyFlag = ' PK'
      else if (isFk) keyFlag = ' FK'

      lines.push(`    ${type} ${colName}${keyFlag}`)
    }

    lines.push('  }')

    // 2. Mapeia relacionamentos a partir das foreign keys
    for (const fk of table.foreignKeys) {
      const parentEntity = sanitizeEntityName(fk.table)
      const childEntity = entityName
      const label = `${fk.from}`

      // Cardinalidade padrão 1 para N (Pai ||--o{ Filho)
      relationships.push(`  ${parentEntity} ||--o{ ${childEntity} : "${label}"`)
    }
  }

  // 3. Adiciona as linhas de relacionamento
  if (relationships.length > 0) {
    lines.push('', '  %% Relacionamentos de Chaves Estrangeiras')
    lines.push(...relationships)
  }

  return lines.join('\n')
}

