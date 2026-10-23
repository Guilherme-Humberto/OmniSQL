import duckdb from 'duckdb'
import { performance } from 'node:perf_hooks'
import type { DatabaseCell, DatabaseQueryResult } from '@/conveyor/database-contracts'

export interface TableSyncPayload {
  schemaName: string
  tableName: string
  columns: string[]
  rows: DatabaseCell[][]
}

/**
 * Converte valores nativos do DuckDB para o formato seguro DatabaseCell da aplicação.
 */
export function formatDuckDbCell(val: unknown): DatabaseCell {
  if (val === null || val === undefined) return null
  if (typeof val === 'bigint') {
    const num = Number(val)
    return Number.isSafeInteger(num) ? num : val.toString()
  }
  if (typeof val === 'number') return val
  if (typeof val === 'boolean') return val ? 1 : 0
  if (val instanceof Date) return val.toISOString()
  if (Buffer.isBuffer(val)) {
    return { type: 'blob', base64: val.toString('base64') }
  }
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return String(val)
}

/**
 * Infere o tipo SQL correspondente no DuckDB a partir de uma amostra de valor.
 */
function inferDuckDbColumnType(val: unknown): string {
  if (val === null || val === undefined) return 'VARCHAR'
  if (typeof val === 'number') {
    return Number.isInteger(val) ? 'BIGINT' : 'DOUBLE'
  }
  if (typeof val === 'boolean') return 'BOOLEAN'
  if (typeof val === 'object' && 'type' in (val as object) && (val as { type: string }).type === 'blob') {
    return 'BLOB'
  }
  return 'VARCHAR'
}

/**
 * Motor em memória do DuckDB para execução de queries analíticas e federadas (Cross-Database).
 */
export class DuckDbEngine {
  private db: duckdb.Database
  private conn: duckdb.Connection
  private readonly syncedTables = new Set<string>()

  constructor() {
    this.db = new duckdb.Database(':memory:')
    this.conn = this.db.connect()
  }

  /**
   * Sincroniza uma tabela externa de PostgreSQL, MySQL ou SQLite para dentro da memória do DuckDB.
   */
  async syncTable(payload: TableSyncPayload): Promise<void> {
    const { schemaName, tableName, columns, rows } = payload
    const cacheKey = `${schemaName}.${tableName}`

    // 1. Cria schema no DuckDB
    await this.runRaw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`)

    // 2. Infere DDL e cria tabela
    const columnDefinitions = columns
      .map((col, colIdx) => {
        const sample = rows.find((r) => r[colIdx] !== null && r[colIdx] !== undefined)?.[colIdx]
        const type = inferDuckDbColumnType(sample)
        return `"${col}" ${type}`
      })
      .join(', ')

    await this.runRaw(`DROP TABLE IF EXISTS "${schemaName}"."${tableName}";`)
    await this.runRaw(`CREATE TABLE "${schemaName}"."${tableName}" (${columnDefinitions || 'id VARCHAR'});`)

    // 3. Insere os registros em batch
    if (rows.length > 0 && columns.length > 0) {
      await this.insertRowsBatch(schemaName, tableName, columns.length, rows)
    }

    // 4. Cria view de conveniência sem ponto: schema_table (ex: mysql_prod_orders)
    const flatViewName = `${schemaName}_${tableName}`
    await this.runRaw(`CREATE OR REPLACE VIEW "${flatViewName}" AS SELECT * FROM "${schemaName}"."${tableName}";`)

    this.syncedTables.add(cacheKey)
  }

  /**
   * Executa uma consulta SQL analítica federada no DuckDB.
   */
  async execute(sql: string): Promise<DatabaseQueryResult> {
    const start = performance.now()

    return new Promise((resolve, reject) => {
      this.conn.all(sql, (err, rawRows: Record<string, unknown>[]) => {
        const durationMs = Math.round((performance.now() - start) * 100) / 100

        if (err) {
          return reject(new Error(`Erro DuckDB: ${err.message}`))
        }

        if (!rawRows || rawRows.length === 0) {
          return resolve({
            columns: [],
            rows: [],
            affectedRows: 0,
            lastInsertRowId: null,
            durationMs,
            truncated: false,
          })
        }

        const columns = Object.keys(rawRows[0] || {})
        const rows: DatabaseCell[][] = rawRows.map((r) =>
          columns.map((c) => formatDuckDbCell(r[c]))
        )

        return resolve({
          columns,
          rows,
          affectedRows: rows.length,
          lastInsertRowId: null,
          durationMs,
          truncated: false,
        })
      })
    })
  }

  /**
   * Reseta a base em memória do DuckDB fechando e recriando a conexão.
   */
  async reset(): Promise<void> {
    this.syncedTables.clear()
    this.conn = this.db.connect()
  }

  /**
   * Encerra a conexão e libera recursos.
   */
  async close(): Promise<void> {
    this.syncedTables.clear()
    return new Promise((resolve) => {
      this.db.close(() => resolve())
    })
  }

  private runRaw(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conn.all(sql, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  private insertRowsBatch(
    schemaName: string,
    tableName: string,
    columnCount: number,
    rows: DatabaseCell[][]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const placeholders = Array.from({ length: columnCount }, () => '?').join(', ')
      const insertSql = `INSERT INTO "${schemaName}"."${tableName}" VALUES (${placeholders})`
      const stmt = this.conn.prepare(insertSql)

      for (const row of rows) {
        // Converte BLOB para base64 se necessário
        const params = row.map((cell) => {
          if (cell !== null && typeof cell === 'object' && 'type' in cell && cell.type === 'blob') {
            return Buffer.from(cell.base64, 'base64')
          }
          return cell
        })
        stmt.run(...params)
      }

      stmt.finalize((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
