export const ChartType = {
  Bar: 'bar',
  Line: 'line',
  Pie: 'pie',
} as const

export type ChartType = (typeof ChartType)[keyof typeof ChartType]

export interface ChartDataPoint {
  id: number
  label: string
  value: number
}

export interface ChartStats {
  count: number
  total: number
  avg: number
  max: number
  min: number
}

export interface ChartDimensions {
  width: number
  height: number
}

export const CHART_PALETTE: readonly string[] = [
  '#ff5c3a', // Brand orange
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f43f5e', // Rose
] as const

