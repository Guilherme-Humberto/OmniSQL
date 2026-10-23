import type { ChartDataPoint } from '../domain/types'

export interface LinePoint {
  x: number
  y: number
  item: ChartDataPoint
  idx: number
}

export function computeLineLayout(
  data: ChartDataPoint[],
  chartWidth: number,
  chartHeight: number,
  padding: { top: number; left: number },
  minValue: number,
  valueRange: number
): { points: LinePoint[]; pathD: string; areaD: string } {
  const points = data.map((item, idx) => {
    const x = padding.left + (idx / Math.max(1, data.length - 1)) * chartWidth
    const y = padding.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight
    return { x, y, item, idx }
  })

  const pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')
  const lastX = points.length ? points[points.length - 1].x : 0
  const firstX = points.length ? points[0].x : 0
  const areaD = `${pathD} L ${lastX} ${padding.top + chartHeight} L ${firstX} ${padding.top + chartHeight} Z`

  return { points, pathD, areaD }
}

