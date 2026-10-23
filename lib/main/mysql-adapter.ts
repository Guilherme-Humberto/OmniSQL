import { performance } from 'node:perf_hooks'
import mysql from 'mysql2/promise'
import type {
  DatabaseCell,
  DatabaseColumn,
  DatabaseForeignKey,
  DatabasePeekResult,
  DatabaseQueryResult,
  DatabaseSchema,
  DatabaseTable,
} from '@/conveyor/database-contracts'
import type { DatabaseAdapter } from './database-adapter'

const MAX_RESULT_ROWS = 1_000

const EntityKind = {
  Table: 'table',
  View: 'view',
} as const

export interface MySQLConfig {
  host: string
  port: number
  user: string
  password?: string
  database: string
  ssl?: boolean
}

interface RawColumnInfo {
  COLUMN_NAME: string
  DATA_TYPE: string
  IS_NULLABLE: string
  COLUMN_KEY: string
}

interface RawTableInfo {
  TABLE_NAME: string
  TABLE_TYPE: string
}

interface RawFkInfo {
  from_col: string
  target_table: string
  target_col: string
}

export class MySQLAdapter implements DatabaseAdapter {
  private readonly pool: mysql.Pool
  private readonly databaseName: string

  constructor(config: MySQLConfig) {
    this.databaseName = config.database
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 10_000,
      waitForConnections: true,
      connectionLimit: 10,
    })
  }

  async listTables(): Promise<DatabaseTable[]> {
    const query = `
      SELECT TABLE_NAME, TABLE_TYPE
      FROM information_schema.tables
      WHERE table_schema = ?
        AND TABLE_TYPE IN ('BASE TABLE', 'VIEW')
      ORDER BY TABLE_NAME;
    `
    const [rows] = await this.pool.query(query, [this.databaseName])
    const typedRows = rows as unknown as RawTableInfo[]

    return typedRows.map((r) => ({
      name: r.TABLE_NAME,
      kind: r.TABLE_TYPE === 'VIEW' ? EntityKind.View : EntityKind.Table,
    }))
  }

  async getSchema(): Promise<DatabaseSchema> {
    const tables = await this.listTables()
    const columnsByTable: Record<string, string[]> = {}

    for (const table of tables) {
      const cols = await this.listColumns(table.name)
      columnsByTable[table.name] = cols.map((c) => c.name)
    }

    return { tables, columnsByTable }
  }

  async listColumns(tableName: string): Promise<DatabaseColumn[]> {
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
      FROM information_schema.columns
      WHERE table_schema = ? AND table_name = ?
      ORDER BY ORDINAL_POSITION;
    `
    const [rows] = await this.pool.query(query, [this.databaseName, tableName])
    const typedRows = rows as unknown as RawColumnInfo[]

    return typedRows.map((r) => ({
      name: r.COLUMN_NAME,
      type: r.DATA_TYPE,
      notNull: r.IS_NULLABLE === 'NO',
      primaryKey: r.COLUMN_KEY === 'PRI',
    }))
  }

  async listForeignKeys(tableName: string): Promise<DatabaseForeignKey[]> {
    const query = `
      SELECT
        COLUMN_NAME AS from_col,
        REFERENCED_TABLE_NAME AS target_table,
        REFERENCED_COLUMN_NAME AS target_col
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `
    const [rows] = await this.pool.query(query, [this.databaseName, tableName])
    const typedRows = rows as unknown as RawFkInfo[]

    return typedRows.map((r, index) => ({
      id: index,
      table: r.target_table,
      from: r.from_col,
      to: r.target_col,
    }))
  }

  async getAllForeignKeys(): Promise<Record<string, DatabaseForeignKey[]>> {
    const tables = await this.listTables()
    const result: Record<string, DatabaseForeignKey[]> = {}

    for (const table of tables) {
      const fks = await this.listForeignKeys(table.name)
      if (fks.length > 0) {
        result[table.name] = fks
      }
    }

    return result
  }

  async peekRecord(targetTable: string, targetColumn: string, value: string | number): Promise<DatabasePeekResult> {
    const escapedTable = targetTable.replaceAll('`', '``')
    const escapedColumn = targetColumn.replaceAll('`', '``')
    const query = `SELECT * FROM \`${escapedTable}\` WHERE \`${escapedColumn}\` = ? LIMIT 1;`

    const [rows] = await this.pool.query(query, [value])
    const typedRows = rows as unknown as Record<string, unknown>[]

    if (!typedRows || typedRows.length === 0 || !typedRows[0]) {
      return {
        targetTable,
        targetColumn,
        found: false,
        record: null,
      }
    }

    const row = typedRows[0]
    const record: Record<string, DatabaseCell> = {}

    for (const [key, val] of Object.entries(row)) {
      record[key] = toMySqlDatabaseCell(val)
    }

    return {
      targetTable,
      targetColumn,
      found: true,
      record,
    }
  }

  async execute(sql: string): Promise<DatabaseQueryResult> {
    const startedAt = performance.now()
    const [rawRows, fields] = await this.pool.query({ sql, rowsAsArray: true })

    const columns = (fields as unknown as { name: string }[] | undefined)?.map((f) => f.name) || []

    if (!Array.isArray(rawRows)) {
      // Se for comando DDL / INSERT / UPDATE / DELETE
      const okPacket = rawRows as unknown as mysql.ResultSetHeader
      return {
        columns: [],
        rows: [],
        affectedRows: okPacket.affectedRows || 0,
        lastInsertRowId: okPacket.insertId ? String(okPacket.insertId) : null,
        durationMs: performance.now() - startedAt,
        truncated: false,
      }
    }

    const typedRows = rawRows as unknown[][]
    const truncated = typedRows.length > MAX_RESULT_ROWS
    const rows = typedRows.slice(0, MAX_RESULT_ROWS).map((row) => row.map(toMySqlDatabaseCell))

    return {
      columns,
      rows,
      affectedRows: rows.length,
      lastInsertRowId: null,
      durationMs: performance.now() - startedAt,
      truncated,
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

export function toMySqlDatabaseCell(value: unknown): DatabaseCell {
  if (value === null || typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return { type: 'blob', base64: Buffer.from(value).toString('base64') }
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

