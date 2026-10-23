import type { DatabaseCell } from '@/conveyor/database-contracts'
import type { CsvExportOptions, SqlExportOptions } from './masking-types'

/**
 * Serializa colunas e linhas mascaradas em formato CSV padrão RFC 4180.
 */
export function serializeToCsv(
  columns: string[],
  rows: DatabaseCell[][],
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ','
  const includeHeaders = options.includeHeaders ?? true

  const escapeCell = (cell: DatabaseCell): string => {
    if (cell === null) return ''
    let text: string
    if (typeof cell === 'object') {
      text = `BLOB(${cell.base64.slice(0, 8)}...)`
    } else {
      text = String(cell)
    }

    if (text.includes(delimiter) || text.includes('"') || text.includes('\n') || text.includes('\r')) {
      return `"${text.replaceAll('"', '""')}"`
    }
    return text
  }

  const lines: string[] = []

  if (includeHeaders) {
    lines.push(columns.map((c) => escapeCell(c)).join(delimiter))
  }

  for (const row of rows) {
    lines.push(row.map(escapeCell).join(delimiter))
  }

  return lines.join('\n')
}

/**
 * Serializa colunas e linhas em uma lista de objetos JSON legíveis.
 */
export function serializeToJson(columns: string[], rows: DatabaseCell[][], pretty = true): string {
  const data = rows.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, idx) => {
      const cell = row[idx]
      if (cell === null) {
        obj[col] = null
      } else if (typeof cell === 'object') {
        obj[col] = { type: 'blob', base64: cell.base64 }
      } else {
        obj[col] = cell
      }
    })
    return obj
  })

  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
}

/**
 * Serializa linhas em comandos SQL INSERT INTO padrão ANSI.
 */
export function serializeToSqlInserts(
  columns: string[],
  rows: DatabaseCell[][],
  options: SqlExportOptions = {}
): string {
  const tableName = options.tableName?.trim() || 'export_data'
  const escapedColumns = columns.map((col) => `"${col.replaceAll('"', '""')}"`).join(', ')

  const formatSqlValue = (cell: DatabaseCell): string => {
    if (cell === null) return 'NULL'
    if (typeof cell === 'number') return String(cell)
    if (typeof cell === 'object') return `'${cell.base64}'`
    return `'${String(cell).replaceAll("'", "''")}'`
  }

  const lines: string[] = [
    `-- Exportação gerada pelo SQL Editor (Em conformidade LGPD/GDPR)`,
    `-- Tabela: ${tableName}`,
    `-- Total de registros: ${rows.length}`,
    '',
  ]

  for (const row of rows) {
    const values = row.map(formatSqlValue).join(', ')
    lines.push(`INSERT INTO "${tableName}" (${escapedColumns}) VALUES (${values});`)
  }

  return lines.join('\n')
}

