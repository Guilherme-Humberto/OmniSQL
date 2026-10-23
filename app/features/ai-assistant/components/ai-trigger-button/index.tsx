import { Sparkles } from 'lucide-react'
import { TriggerButton } from './styles'

interface AiTriggerButtonProps {
  onClick: () => void
}

export function AiTriggerButton({ onClick }: AiTriggerButtonProps) {
  return (
    <TriggerButton type="button" onClick={onClick} title="Abrir Assistente de IA Local (Ollama)">
      <Sparkles size={13} />
      <span>Assistente IA</span>
    </TriggerButton>
  )
}

