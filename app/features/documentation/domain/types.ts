import type { DatabaseColumn, DatabaseForeignKey } from '@/conveyor/database-contracts'

export const DatabaseEntityKind = {
  Table: 'table',
  View: 'view',
} as const

export type DatabaseEntityKind = (typeof DatabaseEntityKind)[keyof typeof DatabaseEntityKind]

export interface TableDocumentationMeta {
  name: string
  kind: DatabaseEntityKind
  columns: DatabaseColumn[]
  foreignKeys: DatabaseForeignKey[]
  comment?: string
}

export interface DocumentationOptions {
  databaseName: string
  driver: 'sqlite' | 'postgres' | 'mysql'
  tables: TableDocumentationMeta[]
  includeViews?: boolean
  generatedAt?: string
}

export interface ColumnCommentSuggestion {
  tableName: string
  columnName: string
  columnType?: string
  originalComment?: string
  suggestedComment: string
  approved: boolean
}

