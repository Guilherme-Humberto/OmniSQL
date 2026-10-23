import type { ColumnCommentSuggestion } from './types'

export const SqlCommentDriver = {
  SQLite: 'sqlite',
  PostgreSQL: 'postgres',
  MySQL: 'mysql',
} as const

export type SqlCommentDriver = (typeof SqlCommentDriver)[keyof typeof SqlCommentDriver]

/**
 * Gera comandos SQL DDL de comentário nativo com base no dialeto do banco de dados.
 */
export function generateSqlCommentStatements(
  driver: SqlCommentDriver | string,
  suggestions: ColumnCommentSuggestion[]
): string {
  const approved = suggestions.filter((s) => s.approved && s.suggestedComment.trim())
  if (approved.length === 0) return '-- Nenhum comentário aprovado para aplicação.'

  const lines: string[] = [
    `-- Comentários DDL gerados pelo SQL Editor (${driver.toUpperCase()})`,
    `-- Total de colunas documentadas: ${approved.length}`,
    '',
  ]

  for (const item of approved) {
    const escapedComment = item.suggestedComment.replaceAll("'", "''")

    if (driver === SqlCommentDriver.PostgreSQL) {
      const escapedTable = `"${item.tableName.replaceAll('"', '""')}"`
      const escapedCol = `"${item.columnName.replaceAll('"', '""')}"`
      lines.push(`COMMENT ON COLUMN ${escapedTable}.${escapedCol} IS '${escapedComment}';`)
    } else if (driver === SqlCommentDriver.MySQL) {
      const escapedTable = `\`${item.tableName.replaceAll('`', '``')}\``
      const escapedCol = `\`${item.columnName.replaceAll('`', '``')}\``
      const type = item.columnType || 'TEXT'
      lines.push(`ALTER TABLE ${escapedTable} MODIFY COLUMN ${escapedCol} ${type} COMMENT '${escapedComment}';`)
    } else {
      // SQLite: como não há COMMENT ON nativo, gera script padronizado
      lines.push(`-- [${item.tableName}.${item.columnName}]: ${escapedComment}`)
    }
  }

  return lines.join('\n')
}
