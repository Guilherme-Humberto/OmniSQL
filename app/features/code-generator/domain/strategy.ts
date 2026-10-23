import type { DatabaseQueryResult } from '@/conveyor/database-contracts'

export interface CodeGeneratorContext {
  sql: string
  result: DatabaseQueryResult | null
  includeTypes: boolean
}

/**
 * Interface para a estratégia de geração de código (SOLID - Open/Closed Principle).
 */
export interface CodeGeneratorStrategy {
  generate(ctx: CodeGeneratorContext): string
}

