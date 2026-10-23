import { RotateCw } from 'lucide-react'
import type { AiStatus } from '@/conveyor/ai-contracts'
import { StatusPill, Dot, RefreshButton } from './styles'

interface AiStatusBadgeProps {
  status: AiStatus | undefined
  isLoading: boolean
  onRefresh: () => void
}

export function AiStatusBadge({ status, isLoading, onRefresh }: AiStatusBadgeProps) {
  const isOnline = Boolean(status?.isOnline)

  return (
    <StatusPill $isOnline={isOnline}>
      <Dot $isOnline={isOnline} />
      <span>
        {isOnline
          ? `Ollama Online (${status?.models.length || 0} modelos)`
          : 'Ollama Offline (127.0.0.1:11434)'}
      </span>
      <RefreshButton
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRefresh()
        }}
        title="Atualizar status do Ollama"
      >
        <RotateCw size={11} className={isLoading ? 'animate-spin' : ''} />
      </RefreshButton>
    </StatusPill>
  )
}

