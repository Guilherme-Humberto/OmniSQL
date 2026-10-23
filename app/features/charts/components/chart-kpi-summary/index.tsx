import type { ChartStats } from '../../domain/types'
import { formatNumber } from '../../domain/chart-analytics'
import { StatsContainer, StatPill } from './styles'

interface ChartKpiSummaryProps {
  stats: ChartStats | null
}

export function ChartKpiSummary({ stats }: ChartKpiSummaryProps) {
  if (!stats) return null

  return (
    <StatsContainer>
      <StatPill>
        <span>Total:</span>
        <strong>{formatNumber(stats.total)}</strong>
      </StatPill>
      <StatPill>
        <span>Média:</span>
        <strong>{formatNumber(stats.avg)}</strong>
      </StatPill>
      <StatPill>
        <span>Maior:</span>
        <strong>{formatNumber(stats.max)}</strong>
      </StatPill>
      <StatPill>
        <span>Registros:</span>
        <strong>{stats.count}</strong>
      </StatPill>
    </StatsContainer>
  )
}
