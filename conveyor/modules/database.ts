import { dialog } from 'electron'
import { z } from 'zod'
import {
  databaseColumnsSchema,
  databaseConnectionSchema,
  databaseQueryInputSchema,
  databaseQueryResultSchema,
  databaseSchemaSchema,
  databaseTablesSchema,
} from '../database-contracts'
import { command, defineModule, query } from '../init'
import { databaseService } from '@/lib/main/database-service'

const connectionIdSchema = z.uuid()
const tableInputSchema = z.object({ connectionId: z.uuid(), tableName: z.string().min(1) })

export const databaseModule = defineModule({
  openSQLite: command(async () => {
    const selection = await dialog.showOpenDialog({
      title: 'Abrir banco SQLite',
      properties: ['openFile'],
      filters: [{ name: 'Bancos SQLite', extensions: ['db', 'sqlite', 'sqlite3'] }],
    })
    if (selection.canceled || !selection.filePaths[0]) return null
    return databaseConnectionSchema.parse(databaseService.openSQLite(selection.filePaths[0]))
  }),
  createSQLite: command(async () => {
    const selection = await dialog.showSaveDialog({
      title: 'Criar banco SQLite',
      defaultPath: 'novo-banco.sqlite',
      filters: [{ name: 'Bancos SQLite', extensions: ['sqlite', 'db'] }],
    })
    if (selection.canceled || !selection.filePath) return null
    return databaseConnectionSchema.parse(databaseService.openSQLite(selection.filePath))
  }),
  tables: query(connectionIdSchema, ({ input }) => databaseTablesSchema.parse(databaseService.listTables(input))),
  schema: query(connectionIdSchema, ({ input }) => databaseSchemaSchema.parse(databaseService.getSchema(input))),
  columns: query(tableInputSchema, ({ input }) =>
    databaseColumnsSchema.parse(databaseService.listColumns(input.connectionId, input.tableName))
  ),
  execute: command(databaseQueryInputSchema, ({ input }) =>
    databaseQueryResultSchema.parse(databaseService.execute(input.connectionId, input.sql))
  ),
  close: command(connectionIdSchema, ({ input }) => databaseService.close(input)),
})
