import type {
  DatabaseColumn,
  DatabaseForeignKey,
  DatabasePeekResult,
  DatabaseQueryResult,
  DatabaseSchema,
  DatabaseTable,
} from '@/conveyor/database-contracts'

export interface DatabaseAdapter {
  listTables(): Promise<DatabaseTable[]>
  getSchema(): Promise<DatabaseSchema>
  listColumns(tableName: string): Promise<DatabaseColumn[]>
  listForeignKeys(tableName: string): Promise<DatabaseForeignKey[]>
  getAllForeignKeys(): Promise<Record<string, DatabaseForeignKey[]>>
  peekRecord(
    targetTable: string,
    targetColumn: string,
    value: string | number
  ): Promise<DatabasePeekResult>
  execute(sql: string): Promise<DatabaseQueryResult>
  close(): Promise<void>
}

