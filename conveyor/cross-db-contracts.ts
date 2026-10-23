import { z } from 'zod'
import { databaseQueryResultSchema } from './database-contracts'

export const crossDbExecuteInputSchema = z.object({
  sql: z.string().min(1),
  connectionIds: z.array(z.string()).optional(),
})

export type CrossDbExecuteInput = z.infer<typeof crossDbExecuteInputSchema>

export const crossDbSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  driver: z.enum(['sqlite', 'postgres', 'mysql']),
  tables: z.array(z.string()),
})

export type CrossDbSource = z.infer<typeof crossDbSourceSchema>

export const crossDbCatalogSchema = z.object({
  sources: z.array(crossDbSourceSchema),
})

export type CrossDbCatalog = z.infer<typeof crossDbCatalogSchema>

export const crossDbFileSelectResultSchema = z.object({
  filePath: z.string().nullable(),
  fileName: z.string().nullable(),
  fileType: z.enum(['csv', 'parquet', 'json', 'sqlite']).nullable(),
})

export type CrossDbFileSelectResult = z.infer<typeof crossDbFileSelectResultSchema>

export { databaseQueryResultSchema }

