import type { AiGenerateInput, AiGenerateOutput, AiStatus } from '@/conveyor/ai-contracts'
import { buildAiPrompt } from '@/app/features/ai-assistant/domain/prompt-builder'
import { parseAiResponse } from '@/app/features/ai-assistant/domain/response-parser'

const OLLAMA_HOST = 'http://127.0.0.1:11434'
const DEFAULT_TIMEOUT_MS = 60_000 // 60s timeout para gerações locais
const STATUS_TIMEOUT_MS = 2_500 // 2.5s para checagem rápida de status

interface OllamaTagModel {
  name: string
  model?: string
  modified_at?: string
  size?: number
}

interface OllamaTagsResponse {
  models?: OllamaTagModel[]
}

interface OllamaGenerateResponse {
  response?: string
  done?: boolean
}

export class OllamaService {
  private host: string

  constructor(host: string = OLLAMA_HOST) {
    this.host = host
  }

  /**
   * Checa o status de conectividade do Ollama local e obtém a lista de modelos instalados.
   */
  async checkStatus(): Promise<AiStatus> {
    try {
      const response = await fetch(`${this.host}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
      })

      if (!response.ok) {
        return {
          isOnline: false,
          host: this.host,
          models: [],
        }
      }

      const data = (await response.json()) as OllamaTagsResponse
      const models = (data.models || []).map((m) => m.name || m.model || '').filter(Boolean)

      // Identifica modelo preferencial recomendado (qwen, deepseek, sqlcoder ou primeiro disponível)
      const defaultModel =
        models.find((m) => /qwen|deepseek|sqlcoder|codellama/i.test(m)) || models[0] || undefined

      return {
        isOnline: true,
        host: this.host,
        models,
        defaultModel,
      }
    } catch {
      return {
        isOnline: false,
        host: this.host,
        models: [],
      }
    }
  }

  /**
   * Gera uma consulta SQL ou especificação de modelagem DDL.
   * Não executa nada no banco de dados (estritamente consultivo).
   */
  async generate(input: AiGenerateInput): Promise<AiGenerateOutput> {
    const { systemPrompt, userPrompt } = buildAiPrompt(input)

    const response = await fetch(`${this.host}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      body: JSON.stringify({
        model: input.model,
        prompt: userPrompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.1, // Baixa temperatura para queries determinísticas e precisas
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `Ollama retornou erro (${response.status}): ${errorText || 'Falha ao processar solicitação'}`
      )
    }

    const data = (await response.json()) as OllamaGenerateResponse
    const rawText = data.response || ''

    const parsed = parseAiResponse(rawText)

    return {
      sql: parsed.sql,
      explanation: parsed.explanation,
      model: input.model,
      mode: input.mode,
    }
  }
}

export const ollamaService = new OllamaService()

