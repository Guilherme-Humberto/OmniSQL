import { dialog } from 'electron'
import type { DatabaseQueryResult } from '@/conveyor/database-contracts'
import type {
  CrossDbCatalog,
  CrossDbExecuteInput,
  CrossDbFileSelectResult,
  CrossDbSource,
} from '@/conveyor/cross-db-contracts'
import { databaseService } from '../database-service'
import { connectionStore } from '../connection-store'
import { DuckDbEngine } from './duckdb-engine'
import { analyzeCrossDbQuery, normalizeSourceSchemaName } from '@/app/features/cross-db/domain/query-analyzer'

const MAX_TABLE_SYNC_ROWS = 50_000

export class DuckDbService {
  private engine: DuckDbEngine

  constructor() {
    this.engine = new DuckDbEngine()
  }

  /**
   * Constrói o catálogo federado de fontes disponíveis para Cross-Database.
   */
  async getCatalog(): Promise<CrossDbCatalog> {
    const profiles = connectionStore.list()
    const sources: CrossDbSource[] = []

    for (const profile of profiles) {
      const schemaName = normalizeSourceSchemaName(profile.name)
      let tables: string[] = []

      // Se a conexão já estiver aberta no databaseService, busca tabelas
      try {
        const schema = await databaseService.getSchema(profile.id)
        tables = schema.tables.map((t) => t.name)
      } catch {
        // Conexão ainda não está aberta no pool; mantém lista vazia ou perfil registrado
        tables = []
      }

      sources.push({
        id: profile.id,
        name: schemaName,
        driver: profile.config.driver,
        tables,
      })
    }

    return { sources }
  }

  /**
   * Abre o seletor nativo do sistema operacional para escolher um arquivo local (CSV, Parquet, JSON, SQLite).
   */
  async selectLocalFile(): Promise<CrossDbFileSelectResult> {
    const result = await dialog.showOpenDialog({
      title: 'Selecionar arquivo para consulta Cross-Database com DuckDB',
      properties: ['openFile'],
      filters: [
        { name: 'Arquivos Suportados', extensions: ['csv', 'tsv', 'parquet', 'json', 'sqlite', 'db'] },
        { name: 'CSV / TSV', extensions: ['csv', 'tsv'] },
        { name: 'Apache Parquet', extensions: ['parquet'] },
        { name: 'JSON', extensions: ['json'] },
        { name: 'SQLite', extensions: ['sqlite', 'db'] },
        { name: 'Todos os Arquivos', extensions: ['*'] },
      ],
    })

    if (result.canceled || !result.filePaths[0]) {
      return { filePath: null, fileName: null, fileType: null }
    }

    const filePath = result.filePaths[0]
    const ext = filePath.split('.').pop()?.toLowerCase() || ''
    const fileName = filePath.split(/[/\\]/).pop() || ''

    let fileType: 'csv' | 'parquet' | 'json' | 'sqlite' = 'csv'
    if (ext === 'parquet') fileType = 'parquet'
    else if (ext === 'json') fileType = 'json'
    else if (ext === 'sqlite' || ext === 'db') fileType = 'sqlite'

    return {
      filePath,
      fileName,
      fileType,
    }
  }

  /**
   * Executa a query federada no DuckDB, sincronizando sob demanda apenas as tabelas referenciadas.
   */
  async execute(input: CrossDbExecuteInput): Promise<DatabaseQueryResult> {
    const { sql } = input
    const catalog = await this.getCatalog()

    // 1. Analisa quais tabelas e conexões são referenciadas na query SQL
    const availableSources = catalog.sources.map((s) => ({
      schemaName: s.name,
      tables: s.tables,
    }))
    const analyzed = analyzeCrossDbQuery(sql, availableSources)

    // 2. Para cada tabela referenciada no SQL, garante que esteja sincronizada na memória do DuckDB
    for (const ref of analyzed.tables) {
      const source = catalog.sources.find((s) => s.name === ref.sourceName)
      if (!source) continue

      try {
        // Consulta os dados da tabela no banco original
        const querySql = `SELECT * FROM "${ref.tableName}" LIMIT ${MAX_TABLE_SYNC_ROWS};`
        const tableData = await databaseService.execute(source.id, querySql)

        // Sincroniza para a memória do DuckDB
        await this.engine.syncTable({
          schemaName: source.name,
          tableName: ref.tableName,
          columns: tableData.columns,
          rows: tableData.rows,
        })
      } catch (err) {
        // Se a tabela não puder ser extraída do banco original, continua para o DuckDB reportar o erro exato
        console.warn(`[DuckDB] Aviso ao sincronizar tabela ${ref.sourceName}.${ref.tableName}:`, err)
      }
    }

    // 3. Executa a query federada final no DuckDB
    return this.engine.execute(sql)
  }

  /**
   * Encerra o serviço do DuckDB.
   */
  async close(): Promise<void> {
    await this.engine.close()
  }
}

export const duckDbService = new DuckDbService()
