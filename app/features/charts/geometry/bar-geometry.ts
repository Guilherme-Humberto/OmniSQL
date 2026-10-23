import type { ChartDataPoint } from '../domain/types'

export interface BarLayout {
  id: number
  x: number
  y: number
  width: number
  height: number
  item: ChartDataPoint
  colorIndex: number
}

export function computeBarLayouts(
  data: ChartDataPoint[],
  chartWidth: number,
  chartHeight: number,
  padding: { top: number; left: number },
  minValue: number,
  valueRange: number
): BarLayout[] {
  const barSpacing = chartWidth / Math.max(1, data.length)
  const barWidth = Math.max(4, Math.min(42, barSpacing * 0.7))

  return data.map((item, idx) => {
    const x = padding.left + idx * barSpacing + (barSpacing - barWidth) / 2
    const heightFrac = Math.max(0, (item.value - minValue) / valueRange)
    const height = Math.max(3, heightFrac * chartHeight)
    const y = padding.top + chartHeight - height

    return {
      id: item.id,
      x,
      y,
      width: barWidth,
      height,
      item,
      colorIndex: idx,
    }
  })
}

