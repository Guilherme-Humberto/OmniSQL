import { performance } from 'node:perf_hooks'
import pg from 'pg'
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

const { Pool } = pg

const MAX_RESULT_ROWS = 1_000

const EntityKind = {
  Table: 'table',
  View: 'view',
} as const

export interface PostgresConfig {
  host: string
  port: number
  user: string
  password?: string
  database: string
  ssl?: boolean
}

export class PostgresAdapter implements DatabaseAdapter {
  private readonly pool: pg.Pool

  constructor(config: PostgresConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 10_000,
    })
  }

  async listTables(): Promise<DatabaseTable[]> {
    const query = `
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type IN ('BASE TABLE', 'VIEW')
      ORDER BY table_name;
    `
    const { rows } = await this.pool.query(query)
    return rows.map((r: { table_name: string; table_type: string }) => ({
      name: r.table_name,
      kind: r.table_type === 'VIEW' ? EntityKind.View : EntityKind.Table,
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
    // Busca colunas
    const colQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `
    // Busca primary keys
    const pkQuery = `
      SELECT ccu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1;
    `

    const [colsRes, pksRes] = await Promise.all([
      this.pool.query(colQuery, [tableName]),
      this.pool.query(pkQuery, [tableName]),
    ])

    const pkSet = new Set(pksRes.rows.map((r: { column_name: string }) => r.column_name))

    return colsRes.rows.map((r: { column_name: string; data_type: string; is_nullable: string }) => ({
      name: r.column_name,
      type: r.data_type,
      notNull: r.is_nullable === 'NO',
      primaryKey: pkSet.has(r.column_name),
    }))
  }

  async listForeignKeys(tableName: string): Promise<DatabaseForeignKey[]> {
    const fkQuery = `
      SELECT
        kcu.column_name AS from_col,
        ccu.table_name AS target_table,
        ccu.column_name AS target_col
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1;
    `
    const { rows } = await this.pool.query(fkQuery, [tableName])

    return rows.map((r: { from_col: string; target_table: string; target_col: string }, index: number) => ({
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
    const escapedTable = targetTable.replaceAll('"', '""')
    const escapedColumn = targetColumn.replaceAll('"', '""')
    const query = `SELECT * FROM "${escapedTable}" WHERE "${escapedColumn}" = $1 LIMIT 1;`

    const { rows } = await this.pool.query(query, [value])
    if (!rows || rows.length === 0 || !rows[0]) {
      return {
        targetTable,
        targetColumn,
        found: false,
        record: null,
      }
    }

    const row = rows[0] as Record<string, unknown>
    const record: Record<string, DatabaseCell> = {}

    for (const [key, val] of Object.entries(row)) {
      record[key] = toPgDatabaseCell(val)
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
    const result = await this.pool.query({ text: sql, rowMode: 'array' })

    const columns = (result.fields || []).map((f) => f.name)
    const rawRows = result.rows as unknown[][]
    const truncated = rawRows.length > MAX_RESULT_ROWS
    const rows = rawRows.slice(0, MAX_RESULT_ROWS).map((row) => row.map(toPgDatabaseCell))

    return {
      columns,
      rows,
      affectedRows: typeof result.rowCount === 'number' ? result.rowCount : rows.length,
      lastInsertRowId: null,
      durationMs: performance.now() - startedAt,
      truncated,
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}

export function toPgDatabaseCell(value: unknown): DatabaseCell {
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

