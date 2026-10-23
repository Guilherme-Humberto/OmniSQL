import { z } from 'zod'

export const databaseConnectionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  path: z.string(),
  driver: z.enum(['sqlite', 'postgres', 'mysql']),
})

export const databaseTableSchema = z.object({
  name: z.string(),
  kind: z.enum(['table', 'view']),
})

export const databaseColumnSchema = z.object({
  name: z.string(),
  type: z.string(),
  notNull: z.boolean(),
  primaryKey: z.boolean(),
})

export const databaseTablesSchema = z.array(databaseTableSchema)
export const databaseColumnsSchema = z.array(databaseColumnSchema)
export const databaseSchemaSchema = z.object({
  tables: databaseTablesSchema,
  columnsByTable: z.record(z.string(), z.array(z.string())),
})

export const databaseCellSchema = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.object({ type: z.literal('blob'), base64: z.string() }),
])

export const databaseForeignKeySchema = z.object({
  id: z.number(),
  table: z.string(),
  from: z.string(),
  to: z.string().nullable(),
})

export const databaseForeignKeysByTableSchema = z.record(z.string(), z.array(databaseForeignKeySchema))

export const databasePeekInputSchema = z.object({
  connectionId: z.uuid(),
  targetTable: z.string().min(1),
  targetColumn: z.string().min(1),
  value: z.union([z.string(), z.number()]),
})

export const databasePeekResultSchema = z.object({
  targetTable: z.string(),
  targetColumn: z.string(),
  found: z.boolean(),
  record: z.record(z.string(), databaseCellSchema).nullable(),
})

export const databaseQueryInputSchema = z.object({
  connectionId: z.uuid(),
  sql: z.string().trim().min(1).max(100_000),
})

export const databaseQueryResultSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.array(databaseCellSchema)),
  affectedRows: z.number().int().nonnegative(),
  lastInsertRowId: z.string().nullable(),
  durationMs: z.number().nonnegative(),
  truncated: z.boolean(),
})

export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>
export type DatabaseTable = z.infer<typeof databaseTableSchema>
export type DatabaseColumn = z.infer<typeof databaseColumnSchema>
export type DatabaseSchema = z.infer<typeof databaseSchemaSchema>
export type DatabaseForeignKey = z.infer<typeof databaseForeignKeySchema>
export type DatabaseForeignKeysByTable = z.infer<typeof databaseForeignKeysByTableSchema>
export type DatabasePeekInput = z.infer<typeof databasePeekInputSchema>
export type DatabasePeekResult = z.infer<typeof databasePeekResultSchema>
export type DatabaseCell = z.infer<typeof databaseCellSchema>
export type DatabaseQueryInput = z.infer<typeof databaseQueryInputSchema>
export type DatabaseQueryResult = z.infer<typeof databaseQueryResultSchema>
