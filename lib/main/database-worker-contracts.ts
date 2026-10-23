import type {
  DatabaseColumn,
  DatabaseForeignKey,
  DatabasePeekResult,
  DatabaseQueryResult,
  DatabaseSchema,
  DatabaseTable,
} from '@/conveyor/database-contracts'

export type DatabaseWorkerCommand =
  | { method: 'listTables' }
  | { method: 'getSchema' }
  | { method: 'listColumns'; argument: string }
  | { method: 'listForeignKeys'; argument: string }
  | { method: 'getAllForeignKeys' }
  | { method: 'peekRecord'; argument: { targetTable: string; targetColumn: string; value: string | number } }
  | { method: 'execute'; argument: string }

export type DatabaseWorkerMessage = DatabaseWorkerCommand & { id: number }

export interface DatabaseWorkerResults {
  listTables: DatabaseTable[]
  getSchema: DatabaseSchema
  listColumns: DatabaseColumn[]
  listForeignKeys: DatabaseForeignKey[]
  getAllForeignKeys: Record<string, DatabaseForeignKey[]>
  peekRecord: DatabasePeekResult
  execute: DatabaseQueryResult
}

export type DatabaseWorkerResponse = { type: 'ready' } | { id: number; result?: unknown; error?: string }
