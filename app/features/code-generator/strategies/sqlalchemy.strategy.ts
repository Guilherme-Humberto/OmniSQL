import type { CodeGeneratorStrategy, CodeGeneratorContext } from '../domain/strategy'
import { inferPythonType } from '../domain/type-inference'

export const sqlalchemyStrategy: CodeGeneratorStrategy = {
  generate({ sql, result, includeTypes }: CodeGeneratorContext): string {
    const trimmedSql = sql.trim()
    const columns = result?.columns ?? []
    const firstRow = result?.rows?.[0] ?? []

    const pyFields = columns.map((col, idx) => {
      const type = inferPythonType(firstRow[idx] ?? null)
      return `    ${col}: ${type}`
    })

    const pydanticModel =
      includeTypes && columns.length
        ? `from pydantic import BaseModel
from typing import Optional

class QueryResult(BaseModel):
${pyFields.join('\n')}

`
        : ''

    return `${pydanticModel}from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

async def execute_query(session: AsyncSession):
    stmt = text("""
${trimmedSql}
    """)
    result = await session.execute(stmt)
    rows = result.mappings().all()
    ${includeTypes && columns.length ? 'return [QueryResult(**row) for row in rows]' : 'return rows'}`
  },
}

