import type { ChartDataPoint } from '../domain/types'

export interface PieSliceLayout {
  id: number
  pathD: string
  colorIndex: number
  item: ChartDataPoint
}

export function computePieSlices(
  data: ChartDataPoint[],
  total: number,
  radius: number,
  innerRadius: number,
  hoveredIndex: number | null
): PieSliceLayout[] {
  let cumulativeAngle = 0
  const effectiveTotal = Math.max(total, 0.0001)

  return data.slice(0, 10).map((item, idx) => {
    const sliceAngle = (item.value / effectiveTotal) * 2 * Math.PI
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + sliceAngle
    cumulativeAngle += sliceAngle

    const isHovered = hoveredIndex === idx
    const currentRadius = isHovered ? radius + 5 : radius

    const x1 = Math.cos(startAngle) * currentRadius
    const y1 = Math.sin(startAngle) * currentRadius
    const x2 = Math.cos(endAngle) * currentRadius
    const y2 = Math.sin(endAngle) * currentRadius

    const ix1 = Math.cos(endAngle) * innerRadius
    const iy1 = Math.sin(endAngle) * innerRadius
    const ix2 = Math.cos(startAngle) * innerRadius
    const iy2 = Math.sin(startAngle) * innerRadius

    const largeArc = sliceAngle > Math.PI ? 1 : 0

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ')

    return {
      id: item.id,
      pathD,
      colorIndex: idx,
      item,
    }
  })
}

