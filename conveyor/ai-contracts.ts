import { z } from 'zod'

export const AiMode = {
  Query: 'query',
  Modeling: 'modeling',
} as const
export type AiMode = (typeof AiMode)[keyof typeof AiMode]

export const aiModeSchema = z.enum([AiMode.Query, AiMode.Modeling])

export const aiStatusSchema = z.object({
  isOnline: z.boolean(),
  host: z.string(),
  models: z.array(z.string()),
  defaultModel: z.string().optional(),
})
export type AiStatus = z.infer<typeof aiStatusSchema>

export const aiColumnSummarySchema = z.object({
  name: z.string(),
  type: z.string(),
  isPrimaryKey: z.boolean().optional(),
  notNull: z.boolean().optional(),
})

export const aiTableSummarySchema = z.object({
  name: z.string(),
  columns: z.array(aiColumnSummarySchema),
})
export type AiTableSummary = z.infer<typeof aiTableSummarySchema>

export const aiGenerateInputSchema = z.object({
  prompt: z.string().min(2, 'O prompt deve ter pelo menos 2 caracteres'),
  mode: aiModeSchema,
  driver: z.enum(['sqlite', 'postgres', 'mysql']),
  model: z.string().min(1, 'Selecione ou informe um modelo'),
  schema: z.array(aiTableSummarySchema).optional(),
})
export type AiGenerateInput = z.infer<typeof aiGenerateInputSchema>

export const aiGenerateOutputSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
  model: z.string(),
  mode: aiModeSchema,
})
export type AiGenerateOutput = z.infer<typeof aiGenerateOutputSchema>

