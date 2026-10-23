import type { CodeGeneratorStrategy, CodeGeneratorContext } from '../domain/strategy'
import { inferTypeScriptType, toCamelCase } from '../domain/type-inference'

export const drizzleStrategy: CodeGeneratorStrategy = {
  generate({ sql, result, includeTypes }: CodeGeneratorContext): string {
    const trimmedSql = sql.trim()
    const columns = result?.columns ?? []
    const firstRow = result?.rows?.[0] ?? []

    const tsFields = columns.map((col, idx) => {
      const type = inferTypeScriptType(firstRow[idx] ?? null)
      return `  ${toCamelCase(col)}: ${type};`
    })

    const typeDef =
      includeTypes && columns.length ? `export interface QueryResult {\n${tsFields.join('\n')}\n}\n\n` : ''

    return `${typeDef}import { sql } from 'drizzle-orm'
import { db } from './db'

export async function executeQuery() {
  const query = sql.raw(\`
${trimmedSql}
  \`)

  const data = await db.all${includeTypes && columns.length ? '<QueryResult>' : ''}(query)
  return data
}`
  },
}
