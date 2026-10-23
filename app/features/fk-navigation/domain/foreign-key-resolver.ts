import type { DatabaseForeignKey, FkTargetInfo } from './types'

/**
 * Heurística de pluralização simples para associar colunas terminadas em `_id`
 * às tabelas candidatas caso não haja foreign key declarada explicitamente no catálogo.
 */
function inferCandidateTables(prefix: string): string[] {
  return [
    `${prefix}s`, // user -> users
    `${prefix}es`, // author -> autores / classes
    prefix, // user -> user
    `${prefix}a`, // categor -> categoria
  ]
}

/**
 * Localiza o destino de chave estrangeira para uma dada coluna.
 * Prioriza chaves explicitamente declaradas no catálogo do banco;
 * se não encontrar, analisa tabelas conhecidas do esquema.
 */
export function resolveForeignKeyTarget(
  columnName: string,
  foreignKeysByTable?: Record<string, DatabaseForeignKey[]>,
  availableTables?: string[],
  activeTable?: string | null
): FkTargetInfo | null {
  if (!columnName) return null

  // 1. Busca direta nas chaves estrangeiras da tabela ativa
  if (activeTable && foreignKeysByTable?.[activeTable]) {
    const directFk = foreignKeysByTable[activeTable].find(
      (fk) => fk.from.toLowerCase() === columnName.toLowerCase()
    )
    if (directFk) {
      return {
        targetTable: directFk.table,
        targetColumn: directFk.to || 'id',
        fromColumn: directFk.from,
      }
    }
  }

  // 2. Busca global em qualquer tabela do catálogo que possua uma FK com essa mesma coluna
  if (foreignKeysByTable) {
    for (const fks of Object.values(foreignKeysByTable)) {
      const match = fks.find((fk) => fk.from.toLowerCase() === columnName.toLowerCase())
      if (match) {
        return {
          targetTable: match.table,
          targetColumn: match.to || 'id',
          fromColumn: match.from,
        }
      }
    }
  }

  // 3. Heurística relacional por convenção de nomenclatura (ex: `user_id`, `cliente_id`, `produto_id`)
  const idMatch = columnName.match(/^(.+)_id$/i)
  if (idMatch && idMatch[1] && availableTables && availableTables.length > 0) {
    const entityPrefix = idMatch[1].toLowerCase()
    const candidates = inferCandidateTables(entityPrefix)

    const matchedTable = availableTables.find((table) =>
      candidates.includes(table.toLowerCase())
    )

    if (matchedTable) {
      return {
        targetTable: matchedTable,
        targetColumn: 'id',
        fromColumn: columnName,
      }
    }
  }

  return null
}

