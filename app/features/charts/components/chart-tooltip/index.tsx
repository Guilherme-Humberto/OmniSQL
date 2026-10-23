import type { ChartDataPoint, ChartStats } from '../../domain/types'
import { TooltipContainer } from './styles'

interface ChartTooltipProps {
  point: ChartDataPoint
  mousePos: { x: number; y: number }
  stats: ChartStats | null
}

export function ChartTooltip({ point, mousePos, stats }: ChartTooltipProps) {
  return (
    <TooltipContainer $x={mousePos.x} $y={mousePos.y}>
      <div className="label">{point.label}</div>
      <div className="value">{point.value.toLocaleString('pt-BR')}</div>
      {stats && stats.total > 0 && (
        <div className="percent">{((point.value / stats.total) * 100).toFixed(1)}% do total</div>
      )}
    </TooltipContainer>
  )
}
