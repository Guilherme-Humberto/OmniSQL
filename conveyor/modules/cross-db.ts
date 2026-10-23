import { command, defineModule, query } from '../init'
import {
  crossDbCatalogSchema,
  crossDbExecuteInputSchema,
  crossDbFileSelectResultSchema,
  databaseQueryResultSchema,
} from '../cross-db-contracts'
import { duckDbService } from '@/lib/main/cross-db/duckdb-service'

export const crossDbModule = defineModule({
  execute: command(crossDbExecuteInputSchema, async ({ input }) =>
    databaseQueryResultSchema.parse(await duckDbService.execute(input))
  ),
  catalog: query(async () =>
    crossDbCatalogSchema.parse(await duckDbService.getCatalog())
  ),
  selectFile: command(async () =>
    crossDbFileSelectResultSchema.parse(await duckDbService.selectLocalFile())
  ),
})
