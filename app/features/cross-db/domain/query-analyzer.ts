/**
 * Analisador de sintaxe para consultas federadas Cross-Database via DuckDB.
 * Identifica schemas, tabelas de conexões ativas e referências a arquivos locais (CSV, Parquet, JSON).
 */

export interface ReferencedTableSource {
  sourceName: string
  tableName: string
  fullIdentifier: string
}

export interface ReferencedFileSource {
  filePath: string
  extension: 'csv' | 'parquet' | 'json' | 'tsv' | 'sqlite'
}

export interface AnalyzedCrossDbQuery {
  tables: ReferencedTableSource[]
  files: ReferencedFileSource[]
}

/**
 * Normaliza o nome de uma conexão para um identificador SQL de schema seguro no DuckDB.
 * Ex: "MySQL Produção" -> "mysql_producao", "Postgres-CRM" -> "postgres_crm".
 */
export function normalizeSourceSchemaName(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')

  // Identificador não pode começar com dígito em SQL sem aspas
  if (/^[0-9]/.test(normalized)) {
    return `src_${normalized}`
  }

  return normalized || 'source'
}

/**
 * Analisa a query SQL para identificar tabelas com schema qualificado (ex: schema.table ou "schema"."table")
 * comparando com as fontes e tabelas registradas no catálogo federado.
 */
export function analyzeCrossDbQuery(
  sql: string,
  availableSources: Array<{ schemaName: string; tables: string[] }>
): AnalyzedCrossDbQuery {
  const referencedTables: ReferencedTableSource[] = []
  const referencedFiles: ReferencedFileSource[] = []

  // 1. Identifica tabelas de conexões conhecidas: schema.tabela ou "schema"."tabela"
  for (const source of availableSources) {
    for (const table of source.tables) {
      // Padrões aceitos:
      // mysql_prod.orders
      // "mysql_prod"."orders"
      // mysql_prod."orders"
      // "mysql_prod".orders
      const pattern = new RegExp(
        `(?:["\`]?${source.schemaName}["\`]?\\s*\\.\\s*["\`]?${table}["\`]?)|(?:["\`]?${source.schemaName}_${table}["\`]?)`,
        'i'
      )

      if (pattern.test(sql)) {
        referencedTables.push({
          sourceName: source.schemaName,
          tableName: table,
          fullIdentifier: `${source.schemaName}.${table}`,
        })
      }
    }
  }

  // 2. Identifica arquivos locais em chamadas read_csv / read_parquet / read_json ou strings de caminho
  const fileRegex = /['"]([^'"]+\.(csv|tsv|parquet|json|sqlite|db))['"]/gi
  let match: RegExpExecArray | null
  const seenFiles = new Set<string>()

  while ((match = fileRegex.exec(sql)) !== null) {
    const rawPath = match[1]
    const ext = match[2]?.toLowerCase()
    if (rawPath && ext && !seenFiles.has(rawPath)) {
      seenFiles.add(rawPath)
      referencedFiles.push({
        filePath: rawPath,
        extension: ext as ReferencedFileSource['extension'],
      })
    }
  }

  return {
    tables: referencedTables,
    files: referencedFiles,
  }
}

/**
 * Monta um snippet padrão de exemplo para consulta cross-database combinando duas fontes ou arquivo local.
 */
export function buildCrossDbSnippet(
  sourceA?: { schemaName: string; tableName: string },
  sourceB?: { schemaName: string; tableName: string },
  filePath?: string
): string {
  if (sourceA && sourceB) {
    return `-- Consulta Federada Cross-Database (DuckDB)
SELECT
  a.*,
  b.*
FROM ${sourceA.schemaName}.${sourceA.tableName} a
JOIN ${sourceB.schemaName}.${sourceB.tableName} b
  ON a.id = b.id
LIMIT 50;`
  }

  if (sourceA && filePath) {
    return `-- Cruzamento de Banco de Dados com Arquivo Local (DuckDB)
SELECT
  db.*,
  csv.*
FROM ${sourceA.schemaName}.${sourceA.tableName} db
JOIN read_csv_auto('${filePath}') csv
  ON db.id = csv.id
LIMIT 50;`
  }

  if (filePath) {
    return `-- Análise de Arquivo Local com DuckDB
SELECT *
FROM read_csv_auto('${filePath}')
LIMIT 100;`
  }

  return `-- Escreva sua query Cross-Database usando schemas das conexões ou arquivos locais
-- Exemplo:
-- SELECT * FROM mysql_prod.orders o JOIN postgres_crm.users u ON o.user_id = u.id;
-- SELECT * FROM read_csv_auto('dados.csv') LIMIT 50;
`
}

