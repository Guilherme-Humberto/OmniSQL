import type { CodeGeneratorStrategy, CodeGeneratorContext } from '../domain/strategy'
import { inferTypeScriptType, toCamelCase } from '../domain/type-inference'

export const prismaStrategy: CodeGeneratorStrategy = {
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

    return `${typeDef}import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function executeQuery() {
  const data = await prisma.$queryRaw${includeTypes && columns.length ? '<QueryResult[]>' : ''}\`
${trimmedSql}
  \`
  return data
}`
  },
}
