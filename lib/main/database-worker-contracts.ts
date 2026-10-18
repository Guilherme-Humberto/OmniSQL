import type { DatabaseColumn, DatabaseQueryResult, DatabaseSchema, DatabaseTable } from '@/conveyor/database-contracts'

export type DatabaseWorkerCommand =
  | { method: 'listTables' }
  | { method: 'getSchema' }
  | { method: 'listColumns'; argument: string }
  | { method: 'execute'; argument: string }

export type DatabaseWorkerMessage = DatabaseWorkerCommand & { id: number }

export interface DatabaseWorkerResults {
  listTables: DatabaseTable[]
  getSchema: DatabaseSchema
  listColumns: DatabaseColumn[]
  execute: DatabaseQueryResult
}

export type DatabaseWorkerResponse = { type: 'ready' } | { id: number; result?: unknown; error?: string }
