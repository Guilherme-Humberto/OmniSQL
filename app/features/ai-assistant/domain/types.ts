import type { AiMode, AiStatus, AiGenerateOutput } from '@/conveyor/ai-contracts'

export type { AiMode, AiStatus, AiGenerateOutput }

export interface AiAssistantState {
  isOpen: boolean
  mode: AiMode
  prompt: string
  selectedModel: string
  isGenerating: boolean
  error: string | null
  lastResult: AiGenerateOutput | null
}

