import {
  aiGenerateInputSchema,
  aiGenerateOutputSchema,
  aiStatusSchema,
} from '../ai-contracts'
import { command, defineModule, query } from '../init'
import { ollamaService } from '@/lib/main/ai/ollama-service'

export const aiModule = defineModule({
  status: query(async () => aiStatusSchema.parse(await ollamaService.checkStatus())),
  generate: command(aiGenerateInputSchema, async ({ input }) =>
    aiGenerateOutputSchema.parse(await ollamaService.generate(input))
  ),
})

