import type { CodeGeneratorStrategy, CodeGeneratorContext } from '../domain/strategy'
import { inferCSharpType, toPascalCase } from '../domain/type-inference'

export const efcoreStrategy: CodeGeneratorStrategy = {
  generate({ sql, result, includeTypes }: CodeGeneratorContext): string {
    const trimmedSql = sql.trim()
    const columns = result?.columns ?? []
    const firstRow = result?.rows?.[0] ?? []

    const csFields = columns.map((col, idx) => {
      const type = inferCSharpType(firstRow[idx] ?? null)
      return `    ${type} ${toPascalCase(col)}`
    })

    const recordDef =
      includeTypes && columns.length ? `public record QueryResult(\n${csFields.join(',\n')}\n);\n\n` : ''

    return `using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace App.Data;

${recordDef}public class QueryService
{
    private readonly AppDbContext _context;

    public QueryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<${includeTypes && columns.length ? 'QueryResult' : 'dynamic'}>> ExecuteQueryAsync()
    {
        var sql = @"
${trimmedSql}";

        return await _context.Database
            .SqlQueryRaw<${includeTypes && columns.length ? 'QueryResult' : 'dynamic'}>(sql)
            .ToListAsync();
    }
}`
  },
}
