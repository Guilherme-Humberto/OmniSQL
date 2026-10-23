import type { CodeTarget } from '../domain/types'
import type { CodeGeneratorStrategy, CodeGeneratorContext } from '../domain/strategy'
import { prismaStrategy } from './prisma.strategy'
import { drizzleStrategy } from './drizzle.strategy'
import { typeormStrategy } from './typeorm.strategy'
import { sqlalchemyStrategy } from './sqlalchemy.strategy'
import { efcoreStrategy } from './efcore.strategy'
import { nextjsApiStrategy } from './nextjs-api.strategy'

/**
 * Registro de estratégias de geração de código.
 * Adicionar um novo framework não requer alterar lógicas existentes (Open/Closed Principle).
 */
export const codeGeneratorStrategies: Record<CodeTarget, CodeGeneratorStrategy> = {
  prisma: prismaStrategy,
  drizzle: drizzleStrategy,
  typeorm: typeormStrategy,
  sqlalchemy: sqlalchemyStrategy,
  efcore: efcoreStrategy,
  nextjs_api: nextjsApiStrategy,
}

export function generateSnippet(target: CodeTarget, ctx: CodeGeneratorContext): string {
  const strategy = codeGeneratorStrategies[target]
  if (!strategy) {
    throw new Error(`Estratégia para o alvo ${target} não encontrada.`)
  }
  return strategy.generate(ctx)
}

