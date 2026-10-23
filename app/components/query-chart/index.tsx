import { useState, useMemo, useRef, useEffect } from 'react'
import { Layers } from 'lucide-react'
import type { DatabaseQueryResult } from '@/conveyor/database-contracts'
import { CHART_PALETTE, ChartType } from '../../features/charts/domain/types'
import {
  detectColumnRoles,
  extractChartData,
  calculateStats,
  formatNumber,
} from '../../features/charts/domain/chart-analytics'
import { computeBarLayouts } from '../../features/charts/geometry/bar-geometry'
import { computeLineLayout } from '../../features/charts/geometry/line-geometry'
import { computePieSlices } from '../../features/charts/geometry/pie-geometry'
import { ChartToolbar } from '../../features/charts/components/chart-toolbar'
import { ChartKpiSummary } from '../../features/charts/components/chart-kpi-summary'
import { ChartTooltip } from '../../features/charts/components/chart-tooltip'
import { ChartContainer, CanvasArea, EmptyNotice } from './styles'

interface QueryChartProps {
  result: DatabaseQueryResult
  initialType?: ChartType
}

/**
 * Mini-Dashboard integrado para visualização analítica rápida de resultados SQL.
 * Segue padrões Clean Architecture e SOLID (geometria e analytics desacoplados).
 */
export function QueryChart({ result, initialType = ChartType.Bar }: QueryChartProps) {
  const [chartType, setChartType] = useState<ChartType>(initialType)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 240 })

  // Observa redimensionamento do painel/janela
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) setDimensions({ width, height })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Análise de tipos de colunas para definir X e Y automaticamente
  const { numericColumns, labelColumns } = useMemo(() => detectColumnRoles(result), [result])

  const [xAxisCol, setXAxisCol] = useState<string>(() => labelColumns[0] || result.columns[0] || '')
  const [yAxisCol, setYAxisCol] = useState<string>(
    () => numericColumns[0] || result.columns[1] || result.columns[0] || ''
  )

  // Extração e agregação de dados
  const data = useMemo(
    () => extractChartData(result, xAxisCol, yAxisCol),
    [result, xAxisCol, yAxisCol]
  )
  const stats = useMemo(() => calculateStats(data), [data])

  if (!data.length) {
    return (
      <EmptyNotice>
        <Layers size={16} />
        <span>Dados insuficientes para gerar gráfico nesta consulta.</span>
      </EmptyNotice>
    )
  }

  const { width, height } = dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 55 }
  const chartWidth = Math.max(100, width - padding.left - padding.right)
  const chartHeight = Math.max(80, height - padding.top - padding.bottom)

  const maxValue = Math.max(stats?.max || 1, 0.0001)
  const minValue = Math.min(stats?.min || 0, 0)
  const valueRange = maxValue - minValue || 1

  // Geometria das barras
  const barLayouts = chartType === ChartType.Bar
    ? computeBarLayouts(data, chartWidth, chartHeight, padding, minValue, valueRange)
    : []

  // Geometria da linha
  const lineLayout = chartType === ChartType.Line
    ? computeLineLayout(data, chartWidth, chartHeight, padding, minValue, valueRange)
    : null

  // Geometria da pizza/donut
  const pieSlices = chartType === ChartType.Pie
    ? computePieSlices(
        data,
        stats?.total || 1,
        Math.min(width, height) * 0.38,
        Math.min(width, height) * 0.22,
        hoveredIndex
      )
    : []

  return (
    <ChartContainer>
      <ChartToolbar
        chartType={chartType}
        columns={result.columns}
        xAxisCol={xAxisCol}
        yAxisCol={yAxisCol}
        onTypeChange={setChartType}
        onXAxisChange={setXAxisCol}
        onYAxisChange={setYAxisCol}
      />

      <ChartKpiSummary stats={stats} />

      <CanvasArea
        ref={containerRef}
        onMouseLeave={() => {
          setHoveredIndex(null)
          setMousePos(null)
        }}
      >
        <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Linhas de grade e valores no eixo Y */}
          {chartType !== 'pie' && (
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const yVal = minValue + valueRange * (1 - ratio)
                const yPos = padding.top + chartHeight * ratio
                return (
                  <g key={`grid-${ratio}`}>
                    <line
                      x1={padding.left}
                      y1={yPos}
                      x2={padding.left + chartWidth}
                      y2={yPos}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      strokeOpacity={0.7}
                    />
                    <text
                      x={padding.left - 8}
                      y={yPos + 4}
                      fill="var(--foreground-muted)"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="'JetBrains Mono Variable', monospace"
                    >
                      {formatNumber(yVal)}
                    </text>
                  </g>
                )
              })}
            </g>
          )}

          {/* Renderização de Barras */}
          {chartType === ChartType.Bar && (
            <g>
              {barLayouts.map((bar) => {
                const isHovered = hoveredIndex === bar.colorIndex
                const color = CHART_PALETTE[bar.colorIndex % CHART_PALETTE.length]

                return (
                  <g
                    key={`bar-${bar.id}`}
                    onMouseEnter={() => {
                      setHoveredIndex(bar.colorIndex)
                      setMousePos({ x: bar.x + bar.width / 2, y: bar.y })
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      rx={3}
                      fill={color}
                      opacity={isHovered ? 1 : 0.82}
                    />
                    {(data.length <= 15 || bar.colorIndex % Math.ceil(data.length / 12) === 0) && (
                      <text
                        x={bar.x + bar.width / 2}
                        y={padding.top + chartHeight + 16}
                        fill="var(--foreground-muted)"
                        fontSize="9.5"
                        textAnchor="middle"
                        style={{ pointerEvents: 'none' }}
                      >
                        {bar.item.label.length > 10 ? `${bar.item.label.slice(0, 9)}…` : bar.item.label}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )}

          {/* Renderização de Linhas */}
          {chartType === ChartType.Line && lineLayout && (
            <g>
              <path d={lineLayout.areaD} fill="url(#chartGradient)" />
              <path d={lineLayout.pathD} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeLinecap="round" />
              {lineLayout.points.map((pt) => {
                const isHovered = hoveredIndex === pt.idx
                return (
                  <g
                    key={`pt-${pt.idx}`}
                    onMouseEnter={() => {
                      setHoveredIndex(pt.idx)
                      setMousePos({ x: pt.x, y: pt.y })
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : data.length > 25 ? 2.5 : 4}
                      fill={isHovered ? '#fff' : 'var(--brand)'}
                      stroke="var(--brand)"
                      strokeWidth={2}
                    />
                    {(data.length <= 15 || pt.idx % Math.ceil(data.length / 12) === 0) && (
                      <text
                        x={pt.x}
                        y={padding.top + chartHeight + 16}
                        fill="var(--foreground-muted)"
                        fontSize="9.5"
                        textAnchor="middle"
                      >
                        {pt.item.label.length > 10 ? `${pt.item.label.slice(0, 9)}…` : pt.item.label}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )}

          {/* Renderização de Pizza / Donut */}
          {chartType === ChartType.Pie && (
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              {pieSlices.map((slice) => {
                const isHovered = hoveredIndex === slice.colorIndex
                const color = CHART_PALETTE[slice.colorIndex % CHART_PALETTE.length]

                return (
                  <path
                    key={`pie-${slice.id}`}
                    d={slice.pathD}
                    fill={color}
                    opacity={isHovered ? 1 : 0.85}
                    stroke="var(--surface)"
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredIndex(slice.colorIndex)
                      setMousePos({ x: width / 2, y: height / 2 - 40 })
                    }}
                  />
                )
              })}
              <text textAnchor="middle" dy="-4" fill="var(--foreground)" fontSize="14" fontWeight="700">
                {formatNumber(stats?.total || 0)}
              </text>
              <text textAnchor="middle" dy="14" fill="var(--foreground-muted)" fontSize="10">
                Total
              </text>
            </g>
          )}
        </svg>

        {hoveredIndex !== null && mousePos && data[hoveredIndex] && (
          <ChartTooltip point={data[hoveredIndex]} mousePos={mousePos} stats={stats} />
        )}
      </CanvasArea>
    </ChartContainer>
  )
}

