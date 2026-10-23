import type { CodeGeneratorStrategy, CodeGeneratorContext } from '../domain/strategy'
import { inferTypeScriptType, toCamelCase } from '../domain/type-inference'

export const nextjsApiStrategy: CodeGeneratorStrategy = {
  generate({ sql, result, includeTypes }: CodeGeneratorContext): string {
    const trimmedSql = sql.trim()
    const columns = result?.columns ?? []
    const firstRow = result?.rows?.[0] ?? []

    const tsFields = columns.map((col, idx) => {
      const type = inferTypeScriptType(firstRow[idx] ?? null)
      return `  ${toCamelCase(col)}: ${type};`
    })

    const typeDef = includeTypes && columns.length ? `interface QueryResult {\n${tsFields.join('\n')}\n}\n\n` : ''

    return `// app/api/data/route.ts (Next.js App Router)
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

${typeDef}export async function GET(request: Request) {
  try {
    const result = await db.query${includeTypes && columns.length ? '<QueryResult[]>' : ''}(\`
${trimmedSql}
    \`)

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}`
  },
}
