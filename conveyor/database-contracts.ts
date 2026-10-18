import { z } from 'zod'

export const databaseConnectionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  path: z.string(),
  driver: z.literal('sqlite'),
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
export type DatabaseCell = z.infer<typeof databaseCellSchema>
export type DatabaseQueryInput = z.infer<typeof databaseQueryInputSchema>
export type DatabaseQueryResult = z.infer<typeof databaseQueryResultSchema>
