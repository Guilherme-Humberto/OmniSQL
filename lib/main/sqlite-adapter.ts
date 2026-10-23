import { DatabaseSync } from 'node:sqlite'
import { performance } from 'node:perf_hooks'
import type {
  DatabaseCell,
  DatabaseColumn,
  DatabaseForeignKey,
  DatabasePeekResult,
  DatabaseQueryResult,
  DatabaseSchema,
  DatabaseTable,
} from '@/conveyor/database-contracts'

const MAX_RESULT_ROWS = 1_000

const EntityKind = {
  Table: 'table',
  View: 'view',
} as const

export class SQLiteAdapter {
  private readonly database: DatabaseSync

  constructor(path: string) {
    this.database = new DatabaseSync(path, { enableForeignKeyConstraints: true })
  }

  listTables(): DatabaseTable[] {
    return this.database
      .prepare(
        "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name"
      )
      .all()
      .map((row) => ({ name: String(row.name), kind: row.type === EntityKind.View ? EntityKind.View : EntityKind.Table }))
  }

  getSchema(): DatabaseSchema {
    const tables = this.listTables()
    const columnsByTable = Object.fromEntries(
      tables.map((table) => [table.name, this.listColumns(table.name).map((column) => column.name)])
    )
    return { tables, columnsByTable }
  }

  listColumns(tableName: string): DatabaseColumn[] {
    const escapedName = tableName.replaceAll('"', '""')
    return this.database
      .prepare(`PRAGMA table_info("${escapedName}")`)
      .all()
      .map((row) => ({
        name: String(row.name),
        type: String(row.type ?? ''),
        notNull: row.notnull === 1,
        primaryKey: row.pk !== 0,
      }))
  }

  listForeignKeys(tableName: string): DatabaseForeignKey[] {
    const escapedName = tableName.replaceAll('"', '""')
    const rows = this.database.prepare(`PRAGMA foreign_key_list("${escapedName}")`).all()

    return rows.map((row) => {
      let targetColumn = row.to == null ? null : String(row.to)
      if (!targetColumn) {
        // Se a chave não especifica a coluna de destino, SQLite aponta para a PK da tabela pai
        const targetTableEscaped = String(row.table).replaceAll('"', '""')
        const targetCols = this.database.prepare(`PRAGMA table_info("${targetTableEscaped}")`).all()
        const pkCol = targetCols.find((c) => Number(c.pk) > 0)
        targetColumn = pkCol ? String(pkCol.name) : 'id'
      }

      return {
        id: Number(row.id),
        table: String(row.table),
        from: String(row.from),
        to: targetColumn,
      }
    })
  }

  getAllForeignKeys(): Record<string, DatabaseForeignKey[]> {
    const tables = this.listTables()
    const result: Record<string, DatabaseForeignKey[]> = {}
    for (const table of tables) {
      const fks = this.listForeignKeys(table.name)
      if (fks.length > 0) {
        result[table.name] = fks
      }
    }
    return result
  }

  peekRecord(targetTable: string, targetColumn: string, value: string | number): DatabasePeekResult {
    const escapedTable = targetTable.replaceAll('"', '""')
    const escapedColumn = targetColumn.replaceAll('"', '""')
    const statement = this.database.prepare(
      `SELECT * FROM "${escapedTable}" WHERE "${escapedColumn}" = ? LIMIT 1`
    )
    const row = statement.get(value) as Record<string, unknown> | undefined

    if (!row) {
      return {
        targetTable,
        targetColumn,
        found: false,
        record: null,
      }
    }

    const record: Record<string, DatabaseCell> = {}
    for (const [key, val] of Object.entries(row)) {
      record[key] = toDatabaseCell(val)
    }

    return {
      targetTable,
      targetColumn,
      found: true,
      record,
    }
  }

  execute(sql: string): DatabaseQueryResult {
    const startedAt = performance.now()
    const statement = this.database.prepare(sql)
    const columns = statement.columns().map((column) => column.name)

    if (columns.length === 0) {
      const result = statement.run()
      return {
        columns,
        rows: [],
        affectedRows: Number(result.changes),
        lastInsertRowId: result.lastInsertRowid == null ? null : String(result.lastInsertRowid),
        durationMs: performance.now() - startedAt,
        truncated: false,
      }
    }

    // Arrays preservam colunas duplicadas, comuns em consultas com JOINs sem alias.
    statement.setReturnArrays(true)
    const rows: DatabaseCell[][] = []
    let truncated = false

    // A grade fica responsiva e previsível mesmo quando a consulta retorna milhões de linhas.
    for (const row of statement.iterate()) {
      if (rows.length === MAX_RESULT_ROWS) {
        truncated = true
        break
      }
      rows.push((row as unknown as unknown[]).map(toDatabaseCell))
    }

    return {
      columns,
      rows,
      affectedRows: rows.length,
      lastInsertRowId: null,
      durationMs: performance.now() - startedAt,
      truncated,
    }
  }

  close(): void {
    this.database.close()
  }
}

function toDatabaseCell(value: unknown): DatabaseCell {
  if (value === null || typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Uint8Array) {
    return { type: 'blob', base64: Buffer.from(value).toString('base64') }
  }
  throw new TypeError('O SQLite retornou um tipo de valor nao serializavel.')
}
