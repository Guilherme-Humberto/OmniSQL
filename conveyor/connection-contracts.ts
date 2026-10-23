import { z } from 'zod'
import { databaseConnectionSchema } from './database-contracts'

/** Drivers que a tela de conexões conhece. Apenas os marcados em `AVAILABLE_DRIVERS` conectam hoje. */
export const connectionDriverSchema = z.enum(['sqlite', 'postgres', 'mysql'])
export const AVAILABLE_DRIVERS: readonly ConnectionDriver[] = ['sqlite']

export const CONNECTION_COLORS = ['slate', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'pink'] as const
export const connectionColorSchema = z.enum(CONNECTION_COLORS)

const sqliteConfigSchema = z.object({
  driver: z.literal('sqlite'),
  path: z.string().trim().min(1, 'Selecione um arquivo SQLite.'),
})

const networkConfigSchema = z.object({
  driver: z.enum(['postgres', 'mysql']),
  host: z.string().trim().min(1, 'Informe o host.').max(255),
  port: z.number().int().min(1).max(65_535),
  user: z.string().trim().max(255),
  database: z.string().trim().max(255),
  ssl: z.boolean(),
})

export const connectionConfigSchema = z.discriminatedUnion('driver', [sqliteConfigSchema, networkConfigSchema])

/** Perfil como o renderer o enxerga: a senha nunca sai do processo principal, só `hasPassword`. */
export const connectionProfileSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  color: connectionColorSchema,
  saved: z.boolean(),
  hasPassword: z.boolean(),
  createdAt: z.number(),
  lastUsedAt: z.number().nullable(),
  config: connectionConfigSchema,
})

/** Rascunho vindo do formulário. `password` vazio + `id` existente reaproveita a senha guardada. */
export const connectionDraftSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().max(120),
  color: connectionColorSchema,
  config: connectionConfigSchema,
  password: z.string().max(4096).optional(),
  savePassword: z.boolean(),
})

export const connectResultSchema = z.object({
  connection: databaseConnectionSchema,
  profile: connectionProfileSchema,
})

export const testResultSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  durationMs: z.number().nonnegative(),
})

export type ConnectionDriver = z.infer<typeof connectionDriverSchema>
export type ConnectionColor = z.infer<typeof connectionColorSchema>
export type ConnectionConfig = z.infer<typeof connectionConfigSchema>
export type ConnectionProfile = z.infer<typeof connectionProfileSchema>
export type ConnectionDraft = z.infer<typeof connectionDraftSchema>
export type ConnectResult = z.infer<typeof connectResultSchema>
export type TestResult = z.infer<typeof testResultSchema>
